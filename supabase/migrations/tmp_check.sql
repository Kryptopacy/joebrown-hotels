SELECT id, name, type, display_order, is_active 
FROM public.menu_categories 
ORDER BY type, display_order
LIMIT 30;
