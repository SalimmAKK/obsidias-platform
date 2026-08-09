import http from "node:http";
import { Worker } from "bullmq";
import { connection } from "./lib/redis.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { QueueName, healthcheckQueue } from "./queues/definitions.js";

// ── Phase 1 scaffold ─────────────────────────────────────────────────────
// This entrypoint does not process real leads yet. Its only job is to prove
// the three things every later phase depends on actually work in this
// deployment: this process can stay alive continuously, it can reach the
// Upstash Redis instance, and it can reach Supabase with the service-role
// key. Once that's confirmed (see the log output after deploying), the real
// queue processors (enrichment, qualification, conversation, ...) get
// added as sibling files under src/queues/processors/ and registered here.

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

  // Proves the queue round-trip end to end: this process enqueues a job,
  // and the worker above (same process, but in production this would
  // typically be a separate consumer) picks it up and processes it.
  await healthcheckQueue.upsertJobScheduler(
    "healthcheck-heartbeat",
    { every: 5 * 60 * 1000 }, // every 5 minutes
    { name: "heartbeat" }
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
