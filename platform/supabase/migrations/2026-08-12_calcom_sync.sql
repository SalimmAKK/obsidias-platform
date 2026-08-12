-- Run this in the Supabase SQL Editor against your existing project.
-- Adds what real Cal.com sync (api/v1/appointments) needs. Idempotent.

alter table appointments
  add column if not exists calcom_booking_uid text;

notify pgrst, 'reload schema';
