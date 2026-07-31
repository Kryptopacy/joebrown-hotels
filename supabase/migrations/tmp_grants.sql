-- Grant usage on schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all relevant tables to anon and authenticated
GRANT SELECT ON public.hotels TO anon, authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT SELECT ON public.gallery_images TO anon, authenticated;

-- For authenticated users, they might also need insert/update/delete depending on admin roles, but let's just make sure SELECT works first.
GRANT ALL ON public.hotels TO authenticated;
GRANT ALL ON public.rooms TO authenticated;
GRANT ALL ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.gallery_images TO authenticated;
