-- Enable realtime for profiles table to track loyalty changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;