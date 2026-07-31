const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`
      DROP POLICY IF EXISTS "staff_users_select" ON public.staff_users;
      CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
        email = (select auth.jwt()->>'email')
        OR
        (select auth.jwt()->>'email') IN (
          SELECT su.email FROM public.staff_users su WHERE su.status = 'approved' AND su.role IN ('dev', 'owner')
        )
      );
    `);
    console.log('staff_users_select is strictly locked down again!');
  } catch(e) {
    console.error('Error:', e.message);
  }
  await client.end();
}
run().catch(console.error);
