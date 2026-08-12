import "server-only";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

// Producer side only — this process (a Vercel serverless function) enqueues
// jobs for platform/worker (a long-running Railway process) to consume. It
// never processes jobs itself. Queue names must match
// platform/worker/src/queues/definitions.ts exactly, or jobs land in a
// queue nothing is listening on.

const REDIS_URL = process.env.REDIS_URL;

let connection: Redis | null = null;
const queues = new Map<string, Queue>();

function getQueue(name: string): Queue | null {
  if (!REDIS_URL) return null;
  if (!connection) connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  if (!queues.has(name)) queues.set(name, new Queue(name, { connection }));
  return queues.get(name)!;
}

/**
 * Enqueue a brand-new lead for enrichment (which itself chains into
 * qualification once it's done — see
 * platform/worker/src/queues/processors/enrichment.ts). Use this only for
 * a lead's first ever inbound signal; for follow-up messages on an
 * existing lead, use enqueueQualification directly so enrichment doesn't
 * re-run needlessly on every message.
 *
 * No-ops with a console warning if REDIS_URL isn't configured, same as
 * enqueueQualification — a lead must never fail to save just because the
 * worker pipeline isn't wired up.
 */
export async function enqueueEnrichment(leadId: string): Promise<void> {
  const queue = getQueue("enrichment");
  if (!queue) {
    console.warn(`[queue] REDIS_URL not configured — skipping enrichment job for lead ${leadId}.`);
    return;
  }
  await queue.add("enrich-lead", { leadId }, { jobId: `enrich-${leadId}-${Date.now()}` });
}

/** Enqueue a lead for AI qualification directly, skipping enrichment. */
export async function enqueueQualification(leadId: string): Promise<void> {
  const queue = getQueue("qualification");
  if (!queue) {
    console.warn(`[queue] REDIS_URL not configured — skipping qualification job for lead ${leadId}.`);
    return;
  }
  await queue.add("qualify-lead", { leadId }, { jobId: `qualify-${leadId}-${Date.now()}` });
}
