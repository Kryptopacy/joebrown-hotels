const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT policyname, qual, with_check FROM pg_policies WHERE tablename = 'staff_users'");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
