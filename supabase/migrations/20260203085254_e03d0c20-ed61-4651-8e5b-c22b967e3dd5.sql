-- Enable realtime for shops table to get instant marker updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;