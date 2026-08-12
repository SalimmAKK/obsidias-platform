import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { enqueueQualification } from "@/lib/queue";

// This route talks to Meta over plain HTTP, not the browser — it must run
// in the Node.js runtime (for crypto) rather than the Edge runtime.
export const runtime = "nodejs";

/**
 * GET — Meta's one-time webhook verification handshake. When you register
 * this URL in the app's WhatsApp > Configuration page, Meta calls it with
 * these query params and expects the raw `hub.challenge` value echoed back
 * as plain text if `hub.verify_token` matches what you configured there.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expectedToken) {
    console.error("[whatsapp webhook] WHATSAPP_VERIFY_TOKEN is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/** Shape of the payload Meta POSTs for the "messages" webhook field. */
interface WhatsAppMessage {
  from: string; // sender's WhatsApp number, digits only, no leading +
  id: string; // Meta's message id — used for de-duplication
  timestamp: string;
  type: string;
  text?: { body: string };
  [key: string]: unknown;
}

interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
}

/** Best-effort text extraction across message types we don't render specially. */
function extractText(message: WhatsAppMessage): string {
  if (message.type === "text" && message.text?.body) return message.text.body;
  if (message.type === "button" && (message as any).button?.text) return (message as any).button.text;
  if (message.type === "interactive") {
    const interactive = (message as any).interactive;
    return interactive?.button_reply?.title || interactive?.list_reply?.title || `[${message.type}]`;
  }
  return `[${message.type} message]`;
}

function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * POST — actual inbound WhatsApp messages. Meta requires a fast 2xx
 * response (it retries on timeout or non-2xx, which can produce duplicate
 * deliveries) so every branch below returns 200 once the payload has been
 * authenticated, even when we skip processing for a known, non-retryable
 * reason (e.g. a status-update ping instead of a message).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("[whatsapp webhook] META_APP_SECRET is not set — refusing to process.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, signature, appSecret)) {
    console.error("[whatsapp webhook] Signature verification failed — rejecting payload.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured) {
    console.error("[whatsapp webhook] Supabase admin client is not configured.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[whatsapp webhook] Payload was not valid JSON.");
    return NextResponse.json({ ok: true }); // ack anyway, nothing to retry into working
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages" || !change.value?.messages?.length) continue;

      const phoneNumberId = change.value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      const { data: agency, error: agencyError } = await supabaseAdmin
        .from("agencies")
        .select("id")
        .eq("whatsapp_phone_number_id", phoneNumberId)
        .maybeSingle();

      if (agencyError) {
        console.error("[whatsapp webhook] Failed to look up agency by phone_number_id:", agencyError);
        continue;
      }
      if (!agency) {
        console.warn(`[whatsapp webhook] No agency configured for phone_number_id ${phoneNumberId}.`);
        continue;
      }

      const contact = change.value.contacts?.[0];

      for (const message of change.value.messages) {
        await processInboundMessage({
          agencyId: agency.id,
          fromNumber: message.from,
          contactName: contact?.profile?.name,
          externalId: message.id,
          text: extractText(message),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function processInboundMessage(input: {
  agencyId: string;
  fromNumber: string;
  contactName?: string;
  externalId: string;
  text: string;
}) {
  const { agencyId, fromNumber, contactName, externalId, text } = input;
  const phone = `+${fromNumber}`;

  // De-dupe: Meta may redeliver the same webhook call on a slow/failed ack.
  const { data: existingMessage } = await supabaseAdmin
    .from("messages")
    .select("id")
    .eq("external_id", externalId)
    .maybeSingle();
  if (existingMessage) {
    console.log(`[whatsapp webhook] Skipping duplicate delivery of message ${externalId}.`);
    return;
  }

  let { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id")
    .eq("agency_id", agencyId)
    .eq("phone", phone)
    .maybeSingle();

  if (leadError) {
    console.error("[whatsapp webhook] Failed to look up lead by phone:", leadError);
    return;
  }

  let leadId: string;
  let isNewLead = false;

  if (lead) {
    leadId = lead.id;
  } else {
    const [firstName, ...rest] = (contactName || "WhatsApp Lead").split(" ");
    const { data: newLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        agency_id: agencyId,
        first_name: firstName,
        last_name: rest.join(" "),
        phone,
        source: "WhatsApp",
        channel: "whatsapp",
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      console.error("[whatsapp webhook] Failed to create lead:", insertError);
      return;
    }
    leadId = newLead.id;
    isNewLead = true;
    console.log(`[whatsapp webhook] Created lead ${leadId} from ${phone}.`);
  }

  const { data: conversation, error: convLookupError } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .eq("channel", "whatsapp")
    .maybeSingle();

  if (convLookupError) {
    console.error("[whatsapp webhook] Failed to look up conversation:", convLookupError);
    return;
  }

  let conversationId: string;
  if (conversation) {
    conversationId = conversation.id;
    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), unread: true })
      .eq("id", conversationId);
  } else {
    const { data: newConversation, error: convInsertError } = await supabaseAdmin
      .from("conversations")
      .insert({
        agency_id: agencyId,
        lead_id: leadId,
        channel: "whatsapp",
        status: "ai",
        unread: true,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (convInsertError || !newConversation) {
      console.error("[whatsapp webhook] Failed to create conversation:", convInsertError);
      return;
    }
    conversationId = newConversation.id;
  }

  const { error: msgInsertError } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    content: text,
    is_ai: false,
    is_human: false,
    channel: "whatsapp",
    external_id: externalId,
  });

  if (msgInsertError) {
    console.error("[whatsapp webhook] Failed to insert message:", msgInsertError);
    return;
  }

  console.log(
    `[whatsapp webhook] Logged inbound message from ${phone} on lead ${leadId}${isNewLead ? " (new lead)" : ""}.`
  );

  enqueueQualification(leadId).catch((err) => {
    console.error(`[whatsapp webhook] Failed to enqueue qualification job for lead ${leadId}:`, err);
  });
}
