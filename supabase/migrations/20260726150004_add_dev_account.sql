INSERT INTO public.staff_users (email, role, status)
VALUES 
  ('kryptopacy@gmail.com', 'developer', 'approved')
ON CONFLICT (email) 
DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
