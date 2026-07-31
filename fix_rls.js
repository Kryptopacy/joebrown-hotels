const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`CREATE POLICY "Allow users to read their own row" ON public.staff_users FOR SELECT USING (auth.jwt()->>'email' = email);`);
    console.log('Policy added successfully');
  } catch (err) {
    console.error('Error:', err.message);
  }
  await client.end();
}
run().catch(console.error);
