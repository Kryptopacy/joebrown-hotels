const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Make is_approved_staff SECURITY DEFINER so it bypasses RLS on staff_users
    await client.query(`
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
    `);
    console.log("Updated is_approved_staff to SECURITY DEFINER.");
    
    // Also, update the policies in staff_users that might cause recursion
    // The policy staff_users_select does: 
    // OR (select auth.jwt()->>'email') IN (SELECT su.email FROM public.staff_users su WHERE ...)
    // That subquery ALSO causes infinite recursion for staff_users.
    // Let's create a separate SECURITY DEFINER function to check if the user is a dev/owner, 
    // or just use a simpler policy.
    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_dev_or_owner()
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
          AND role IN ('dev', 'owner')
        );
      $$;
    `);

    // Update staff_users policies to use the SECURITY DEFINER function
    await client.query(`
      DROP POLICY IF EXISTS "staff_users_select" ON public.staff_users;
      CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
        email = (select auth.jwt()->>'email') OR public.is_dev_or_owner()
      );

      DROP POLICY IF EXISTS "staff_users_insert" ON public.staff_users;
      CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
        (email = (select auth.jwt()->>'email') AND status = 'pending' AND role = 'receptionist')
        OR public.is_dev_or_owner()
      );

      DROP POLICY IF EXISTS "staff_users_update" ON public.staff_users;
      CREATE POLICY "staff_users_update" ON public.staff_users FOR UPDATE USING (
        public.is_dev_or_owner()
      );

      DROP POLICY IF EXISTS "staff_users_delete" ON public.staff_users;
      CREATE POLICY "staff_users_delete" ON public.staff_users FOR DELETE USING (
        public.is_dev_or_owner()
      );
    `);
    console.log("Fixed staff_users recursion issues.");

  } catch (err) {
    console.error("Error fixing recursion:", err);
  } finally {
    client.end();
  }
}
run();
