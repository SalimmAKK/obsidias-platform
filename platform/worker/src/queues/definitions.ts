import { Queue } from "bullmq";
import { connection } from "../lib/redis.js";

// The seven pipeline stages, per the product's automation design. Each gets
// its own queue so concurrency/retry behavior can be tuned per stage
// independently (e.g. conversation sends should retry more cautiously than
// enrichment lookups).
export const QueueName = {
  HEALTHCHECK: "healthcheck", // scaffold-only, safe to remove once Phase 1 is verified
  ENRICHMENT: "enrichment",
  QUALIFICATION: "qualification",
  CONVERSATION: "conversation",
  SCORING: "scoring",
  APPOINTMENTS: "appointments",
  CRM_SYNC: "crm-sync",
  REACTIVATION: "reactivation",
} as const;

export type QueueNameType = (typeof QueueName)[keyof typeof QueueName];

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
  removeOnComplete: { count: 500 },
  removeOnFail: { count: 1000 },
};

function makeQueue(name: QueueNameType) {
  return new Queue(name, { connection, defaultJobOptions });
}

export const healthcheckQueue = makeQueue(QueueName.HEALTHCHECK);
export const enrichmentQueue = makeQueue(QueueName.ENRICHMENT);
export const qualificationQueue = makeQueue(QueueName.QUALIFICATION);
export const conversationQueue = makeQueue(QueueName.CONVERSATION);
export const scoringQueue = makeQueue(QueueName.SCORING);
export const appointmentsQueue = makeQueue(QueueName.APPOINTMENTS);
export const crmSyncQueue = makeQueue(QueueName.CRM_SYNC);
export const reactivationQueue = makeQueue(QueueName.REACTIVATION);

export const allQueues = [
  healthcheckQueue,
  enrichmentQueue,
  qualificationQueue,
  conversationQueue,
  scoringQueue,
  appointmentsQueue,
  crmSyncQueue,
  reactivationQueue,
];
