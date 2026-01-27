-- Add RLS policies for shops table to prevent unauthorized modifications

-- Policy: Allow authenticated users to create shops (only if they're the owner)
CREATE POLICY "Allow authenticated users to create shops"
ON public.shops
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow shop owners to update their own shop
CREATE POLICY "Allow shop owners to update their own shop"
ON public.shops
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow shop owners to delete their own shop
CREATE POLICY "Allow shop owners to delete their own shop"
ON public.shops
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);