import "server-only";

// Cal.com API v2 (https://cal.com/docs/api-reference/v2). Booking a real
// slot on the agency's connected calendar (Google Calendar, etc.) via
// Cal.com, on top of the local `appointments` row that's the source of
// truth for the dashboard UI. This is optional — an agency that hasn't
// connected Cal.com yet still gets working local scheduling, just without
// a real calendar entry.

const CALCOM_API_BASE = "https://api.cal.com/v2";
const CALCOM_API_VERSION = "2024-08-13";

export function isCalcomConfigured(): boolean {
  return Boolean(process.env.CALCOM_API_KEY && process.env.CALCOM_EVENT_TYPE_ID);
}

interface CreateBookingInput {
  startIso: string;
  attendeeName: string;
  attendeeEmail: string;
  notes?: string;
}

interface CreateBookingResult {
  uid: string;
}

/**
 * Creates a real booking on the connected Cal.com event type. Throws with
 * a descriptive message on any failure — callers should catch this and
 * treat it as "the local appointment still exists, just isn't synced,"
 * never as a reason to fail the whole booking request.
 */
export async function createCalcomBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const apiKey = process.env.CALCOM_API_KEY;
  const eventTypeId = process.env.CALCOM_EVENT_TYPE_ID;
  if (!apiKey || !eventTypeId) {
    throw new Error("Cal.com is not configured (CALCOM_API_KEY / CALCOM_EVENT_TYPE_ID missing).");
  }

  const res = await fetch(`${CALCOM_API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": CALCOM_API_VERSION,
    },
    body: JSON.stringify({
      start: input.startIso,
      eventTypeId: Number(eventTypeId),
      attendee: {
        name: input.attendeeName,
        email: input.attendeeEmail,
        timeZone: process.env.CALCOM_ATTENDEE_TIMEZONE || "Asia/Riyadh",
        language: "en",
      },
      ...(input.notes ? { bookingFieldsResponses: { notes: input.notes } } : {}),
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error?.message || body?.message || `Cal.com responded ${res.status}`;
    throw new Error(`Cal.com booking failed: ${message}`);
  }

  // v2 wraps the created resource in `data`; fall back to a bare `uid` in
  // case that shape changes, rather than crashing on a successful booking.
  const uid = body?.data?.uid || body?.uid;
  if (!uid) {
    throw new Error("Cal.com booking succeeded but returned no booking uid.");
  }

  return { uid };
}

/** Cancels a previously created Cal.com booking (used when an appointment is cancelled locally). */
export async function cancelCalcomBooking(bookingUid: string, reason?: string): Promise<void> {
  const apiKey = process.env.CALCOM_API_KEY;
  if (!apiKey) throw new Error("Cal.com is not configured (CALCOM_API_KEY missing).");

  const res = await fetch(`${CALCOM_API_BASE}/bookings/${bookingUid}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": CALCOM_API_VERSION,
    },
    body: JSON.stringify({ cancellationReason: reason || "Cancelled in Obsidias." }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || body?.message || `Cal.com responded ${res.status}`;
    throw new Error(`Cal.com cancellation failed: ${message}`);
  }
}
