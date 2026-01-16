-- Add RLS policies for mystery_bags table - shop owners can manage their bags
CREATE POLICY "Shop owners can insert mystery bags"
ON public.mystery_bags
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = mystery_bags.shop_id
  )
);

CREATE POLICY "Shop owners can update mystery bags"
ON public.mystery_bags
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = mystery_bags.shop_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = mystery_bags.shop_id
  )
);

CREATE POLICY "Shop owners can delete mystery bags"
ON public.mystery_bags
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = mystery_bags.shop_id
  )
);

-- Add UPDATE policy for orders table - shop owners can update orders for their shops
CREATE POLICY "Shop owners can update orders for their shops"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT s.owner_id 
    FROM public.shops s
    INNER JOIN public.mystery_bags mb ON mb.shop_id = s.id
    WHERE mb.id = orders.bag_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT s.owner_id 
    FROM public.shops s
    INNER JOIN public.mystery_bags mb ON mb.shop_id = s.id
    WHERE mb.id = orders.bag_id
  )
);

-- Enable realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;