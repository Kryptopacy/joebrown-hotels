const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('Fixing staff_users policies...');
    
    // Drop all old policies
    await client.query(`DROP POLICY IF EXISTS "Allow staff to read staff_users" ON public.staff_users;`);
    await client.query(`DROP POLICY IF EXISTS "Allow dev/owner to manage staff" ON public.staff_users;`);
    await client.query(`DROP POLICY IF EXISTS "Allow users to request access" ON public.staff_users;`);
    await client.query(`DROP POLICY IF EXISTS "Allow users to insert themselves as pending" ON public.staff_users;`);
    await client.query(`DROP POLICY IF EXISTS "Allow users to read their own row" ON public.staff_users;`);

    // Create 4 distinct policies
    await client.query(`
      CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
        email = (select auth.jwt()->>'email')
        OR
        (select auth.jwt()->>'email') IN (
          SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
        )
      );
    `);

    await client.query(`
      CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
        (email = (select auth.jwt()->>'email') AND status = 'pending' AND role = 'receptionist')
        OR
        (select auth.jwt()->>'email') IN (
          SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
        )
      );
    `);

    await client.query(`
      CREATE POLICY "staff_users_update" ON public.staff_users FOR UPDATE USING (
        (select auth.jwt()->>'email') IN (
          SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
        )
      );
    `);

    await client.query(`
      CREATE POLICY "staff_users_delete" ON public.staff_users FOR DELETE USING (
        (select auth.jwt()->>'email') IN (
          SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
        )
      );
    `);

    console.log('All staff_users policies replaced!');
  } catch (err) {
    console.error('Error applying fixes:', err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
