const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('Fixing push_subscriptions policy...');
    await client.query(`DROP POLICY IF EXISTS "Allow public all on push_subscriptions" ON public.push_subscriptions;`);
    await client.query(`
      CREATE POLICY "Users can manage their own push subscriptions" 
      ON public.push_subscriptions FOR ALL 
      USING (auth.uid() = user_id);
    `);
    
    console.log('Switching is_approved_staff to SECURITY INVOKER...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.is_approved_staff()
      RETURNS boolean
      LANGUAGE sql
      SECURITY INVOKER
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
    
    // Revoke public execution to hide it from the PostgREST API if needed, 
    // but the Linter is happy if it's SECURITY INVOKER because it respects RLS.
    console.log('All fixes applied successfully!');
  } catch (err) {
    console.error('Error applying fixes:', err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
