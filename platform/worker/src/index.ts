import http from "node:http";
import { Worker } from "bullmq";
import { connection } from "./lib/redis.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { QueueName, healthcheckQueue, reactivationQueue } from "./queues/definitions.js";
import { processQualificationJob } from "./queues/processors/qualification.js";
import { processReactivationSweep } from "./queues/processors/reactivation.js";
import { processConversationJob } from "./queues/processors/conversation.js";

// Phase 1 proved the plumbing (Redis, Supabase, a process that stays
// alive). Phase 2 starts here: the qualification queue is now a real
// processor, calling OpenAI to run BANT assessment against leads created
// via the dashboard (or, once WhatsApp is wired up, real inbound
// messages). Enrichment, conversation, scoring, appointments, crm-sync,
// and reactivation still have no processors — same pattern, added one at
// a time under src/queues/processors/ and registered below.

async function verifyConnections() {
  console.log("[startup] Verifying Redis connection...");
  const pong = await connection.ping();
  if (pong !== "PONG") throw new Error(`Unexpected Redis ping response: ${pong}`);
  console.log("[startup] Redis OK.");

  console.log("[startup] Verifying Supabase connection...");
  const { error } = await supabaseAdmin.from("agencies").select("id", { count: "exact", head: true });
  if (error) throw new Error(`Supabase check failed: ${error.message}`);
  console.log("[startup] Supabase OK.");
}

async function main() {
  await verifyConnections();

  const worker = new Worker(
    QueueName.HEALTHCHECK,
    async (job) => {
      console.log(`[healthcheck] tick at ${new Date().toISOString()} (job ${job.id})`);
    },
    { connection }
  );

  worker.on("failed", (job, err) => {
    console.error(`[healthcheck] job ${job?.id} failed:`, err.message);
  });

  const qualificationWorker = new Worker(QueueName.QUALIFICATION, processQualificationJob, {
    connection,
    concurrency: 3,
  });

  qualificationWorker.on("completed", (job) => {
    console.log(`[qualification] job ${job.id} completed.`);
  });
  qualificationWorker.on("failed", (job, err) => {
    console.error(`[qualification] job ${job?.id} failed:`, err.message);
  });

  const reactivationWorker = new Worker(QueueName.REACTIVATION, processReactivationSweep, { connection });

  reactivationWorker.on("completed", (job) => {
    console.log(`[reactivation] job ${job.id} completed.`);
  });
  reactivationWorker.on("failed", (job, err) => {
    console.error(`[reactivation] job ${job?.id} failed:`, err.message);
  });

  const conversationWorker = new Worker(QueueName.CONVERSATION, processConversationJob, {
    connection,
    concurrency: 3,
  });

  conversationWorker.on("completed", (job) => {
    console.log(`[conversation] job ${job.id} completed.`);
  });
  conversationWorker.on("failed", (job, err) => {
    console.error(`[conversation] job ${job?.id} failed:`, err.message);
  });

  // Proves the queue round-trip end to end: this process enqueues a job,
  // and the worker above (same process, but in production this would
  // typically be a separate consumer) picks it up and processes it.
  await healthcheckQueue.upsertJobScheduler(
    "healthcheck-heartbeat",
    { every: 5 * 60 * 1000 }, // every 5 minutes
    { name: "heartbeat" }
  );

  // 6am UTC = 9am Riyadh (Saudi Arabia doesn't observe DST, so this offset
  // is stable year-round). Sweeps for cold leads once a day rather than
  // continuously — reactivation is a daily-cadence concern, not real-time.
  await reactivationQueue.upsertJobScheduler(
    "reactivation-daily-sweep",
    { pattern: "0 6 * * *" },
    { name: "daily-sweep" }
  );

  console.log("[startup] Worker service is up. Watching for jobs...");

  // Railway (and most PaaS health checks) expect something listening on
  // $PORT even for a background worker, or they'll consider the deploy
  // unhealthy and restart it in a loop.
  const port = Number(process.env.PORT) || 3001;
  http
    .createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("obsidias-worker: alive\n");
    })
    .listen(port, () => {
      console.log(`[startup] Health server listening on :${port}`);
    });
}

main().catch((err) => {
  console.error("[startup] Fatal error, exiting:", err);
  process.exit(1);
});
