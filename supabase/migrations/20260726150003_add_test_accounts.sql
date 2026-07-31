GRANT ALL ON public.staff_users TO service_role;

INSERT INTO public.staff_users (email, role, status)
VALUES 
  ('test@joebrownhotels.com', 'developer', 'approved'),
  ('business@joebrownhotels.com', 'super_admin', 'approved')
ON CONFLICT (email) 
DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
