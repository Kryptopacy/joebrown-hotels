-- Drop all previous overlapping policies to fix performance and multiple permissive policy warnings
DROP POLICY IF EXISTS "Allow staff to read staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Allow dev/owner to manage staff" ON public.staff_users;
DROP POLICY IF EXISTS "Allow users to request access" ON public.staff_users;
DROP POLICY IF EXISTS "Allow users to insert themselves as pending" ON public.staff_users;
DROP POLICY IF EXISTS "Allow users to read their own row" ON public.staff_users;

-- Create 4 distinct, non-overlapping, high-performance policies
DROP POLICY IF EXISTS "staff_users_select" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_insert" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_update" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_delete" ON public.staff_users;

CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
  email = (select auth.jwt()->>'email')
  OR
  (select auth.jwt()->>'email') IN (
    SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
  )
);

CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
  (email = (select auth.jwt()->>'email') AND status = 'pending' AND role = 'receptionist')
  OR
  (select auth.jwt()->>'email') IN (
    SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
  )
);

CREATE POLICY "staff_users_update" ON public.staff_users FOR UPDATE USING (
  (select auth.jwt()->>'email') IN (
    SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
  )
);

CREATE POLICY "staff_users_delete" ON public.staff_users FOR DELETE USING (
  (select auth.jwt()->>'email') IN (
    SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
  )
);
