-- Add business hours columns to shops table
ALTER TABLE public.shops ADD COLUMN opening_time TIME DEFAULT '09:00';
ALTER TABLE public.shops ADD COLUMN closing_time TIME DEFAULT '21:00';
ALTER TABLE public.shops ADD COLUMN days_open TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'];