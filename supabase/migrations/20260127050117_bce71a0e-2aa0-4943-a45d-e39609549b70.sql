-- Create profiles table with loyalty system columns
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  last_point_date TIMESTAMPTZ,
  tier TEXT NOT NULL DEFAULT 'New Pup' CHECK (tier IN ('New Pup', 'Top Dog', 'Pack Leader')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to add loyalty point (with daily cap and min value check)
CREATE OR REPLACE FUNCTION public.add_loyalty_point(p_user_id UUID, p_order_total NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_date DATE;
  v_current_points INTEGER;
  v_new_tier TEXT;
BEGIN
  -- Check minimum value (1500 KZT)
  IF p_order_total < 1500 THEN
    RETURN FALSE;
  END IF;

  -- Get current profile data
  SELECT last_point_date::date, loyalty_points INTO v_last_date, v_current_points
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Check if already got point today
  IF v_last_date = CURRENT_DATE THEN
    RETURN FALSE;
  END IF;

  -- Calculate new tier
  v_current_points := v_current_points + 1;
  IF v_current_points >= 20 THEN
    v_new_tier := 'Pack Leader';
  ELSIF v_current_points >= 5 THEN
    v_new_tier := 'Top Dog';
  ELSE
    v_new_tier := 'New Pup';
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET loyalty_points = v_current_points,
      last_point_date = now(),
      tier = v_new_tier
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;