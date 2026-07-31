const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('SET SESSION AUTHORIZATION authenticated');
  await client.query("SET request.jwt.claims TO '{\"email\": \"kryptopacy@gmail.com\", \"role\": \"authenticated\"}'");
  try {
    const res = await client.query('SELECT * FROM public.staff_users');
    console.log('Result:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  }
  await client.end();
}
run().catch(console.error);
