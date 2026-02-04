-- Add missing columns to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'bakery';