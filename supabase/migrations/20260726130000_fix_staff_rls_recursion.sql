-- Fix infinite recursion in staff_users RLS

-- 1. Make the helper function SECURITY DEFINER so it bypasses RLS when checking permissions
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.staff_users 
    WHERE email = (select auth.jwt()->>'email') 
    AND status = 'approved'
  );
$$;

-- 2. Simplify the SELECT policy on staff_users so users can read their own row without recursion
DROP POLICY IF EXISTS "Allow staff to read staff_users" ON public.staff_users;

CREATE POLICY "Allow users to read their own staff row" 
ON public.staff_users FOR SELECT 
TO authenticated
USING (email = (select auth.jwt()->>'email'));

-- Also allow approved staff to read ALL staff (using the now-safe function)
CREATE POLICY "Allow approved staff to read all staff" 
ON public.staff_users FOR SELECT 
TO authenticated
USING (public.is_approved_staff());
