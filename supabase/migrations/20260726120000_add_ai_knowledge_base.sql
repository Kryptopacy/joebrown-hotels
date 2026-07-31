-- Add AI knowledge base fields to hotels table
-- These are stored as individual columns for structured retrieval
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS ai_checkin_policy      TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_wifi_info            TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_parking_info         TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_pet_smoking_policy   TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_amenities            TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_custom_faq           TEXT DEFAULT NULL;

-- Add requires_human flag to intercom sessions so AI knows when to step back
ALTER TABLE customer_intercom_messages
  ADD COLUMN IF NOT EXISTS requires_human BOOLEAN DEFAULT FALSE;

-- Create a view/index to efficiently check session handoff status
CREATE INDEX IF NOT EXISTS idx_intercom_session_human
  ON customer_intercom_messages (session_id, requires_human);
