import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env and fill it in (locally), ` +
        `or set it in Railway's Variables tab (deployed).`
    );
  }
  return value;
}

export const env = {
  // ioredis-compatible connection string from Upstash — NOT the REST
  // URL/Token pair, those are for a different HTTP-based SDK that BullMQ
  // can't use. Looks like rediss://default:<password>@<host>:6379
  REDIS_URL: required("REDIS_URL"),

  // Service-role key — this process runs unattended with no user session,
  // so it always needs to bypass RLS deliberately (unlike the dashboard's
  // API routes, which use the session-aware client where possible).
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),

  // Optional until the corresponding phase is wired up. Left undefined is
  // fine — each integration's job processor should check for its own key
  // and fail loudly (not silently no-op) if it's missing when invoked.
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  META_APP_SECRET: process.env.META_APP_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  APOLLO_API_KEY: process.env.APOLLO_API_KEY,
  CLEARBIT_API_KEY: process.env.CLEARBIT_API_KEY,
  CALCOM_API_KEY: process.env.CALCOM_API_KEY,
  GOHIGHLEVEL_API_KEY: process.env.GOHIGHLEVEL_API_KEY,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
};
