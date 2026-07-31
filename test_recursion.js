const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // Switch to authenticated role and mock the JWT
    await client.query(`
      SET LOCAL role = authenticated;
      SET LOCAL request.jwt.claims = '{"email": "kryptopacy@gmail.com"}';
    `);
    const res = await client.query("SELECT * FROM public.staff_users");
    console.log('Rows:', res.rows.length);
  } catch(e) {
    console.error('Error:', e.message);
  }
  await client.end();
}
run().catch(console.error);
