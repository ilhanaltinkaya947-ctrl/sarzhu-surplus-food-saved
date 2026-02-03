-- Add per-day business hours as JSONB
-- Structure: {"mon": {"open": "09:00", "close": "21:00"}, "tue": {...}, ...}
ALTER TABLE public.shops ADD COLUMN business_hours JSONB DEFAULT '{
  "mon": {"open": "09:00", "close": "21:00"},
  "tue": {"open": "09:00", "close": "21:00"},
  "wed": {"open": "09:00", "close": "21:00"},
  "thu": {"open": "09:00", "close": "21:00"},
  "fri": {"open": "09:00", "close": "21:00"},
  "sat": {"open": "10:00", "close": "18:00"},
  "sun": {"open": "10:00", "close": "18:00"}
}'::jsonb;