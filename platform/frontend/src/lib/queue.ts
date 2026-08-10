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
let qualificationQueue: Queue | null = null;

function getQualificationQueue(): Queue | null {
  if (!REDIS_URL) return null;
  if (!connection) connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  if (!qualificationQueue) qualificationQueue = new Queue("qualification", { connection });
  return qualificationQueue;
}

/**
 * Enqueue a lead for AI qualification. No-ops with a console warning if
 * REDIS_URL isn't configured (e.g. local dev before Phase 2 setup) rather
 * than throwing — adding a lead should never fail just because the worker
 * pipeline isn't wired up yet.
 */
export async function enqueueQualification(leadId: string): Promise<void> {
  const queue = getQualificationQueue();
  if (!queue) {
    console.warn(`[queue] REDIS_URL not configured — skipping qualification job for lead ${leadId}.`);
    return;
  }
  await queue.add("qualify-lead", { leadId }, { jobId: `qualify-${leadId}-${Date.now()}` });
}
