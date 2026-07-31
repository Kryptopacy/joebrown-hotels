const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE tablename = 'hotels'");
  console.log('hotels policies:', res.rows);
  const res2 = await client.query("SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE tablename = 'guests'");
  console.log('guests policies:', res2.rows);
  client.end();
}
run();
