-- Add order_number column for pickup verification
ALTER TABLE public.orders ADD COLUMN order_number TEXT;

-- Create a function to generate unique order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  v_date_part TEXT;
  v_random_part TEXT;
BEGIN
  -- Format: YYMMDD-XXXX (date + 4 random alphanumeric)
  v_date_part := to_char(NOW(), 'YYMMDD');
  v_random_part := upper(substring(md5(random()::text) from 1 for 4));
  NEW.order_number := v_date_part || '-' || v_random_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate order numbers
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- Update existing orders with generated numbers
UPDATE public.orders 
SET order_number = to_char(created_at, 'YYMMDD') || '-' || upper(substring(md5(id::text) from 1 for 4))
WHERE order_number IS NULL;