import { Redis } from "ioredis";
import { env } from "./env.js";

// BullMQ requires this exact option — without it, ioredis will throw on
// the first command issued before a connection is established, which
// happens constantly with queue producers/consumers.
export const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err: Error) => {
  console.error("[redis] connection error:", err.message);
});
