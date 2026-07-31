const postgres = require('postgres');
const fs = require('fs');

async function run() {
  const sql = postgres('postgresql://postgres:Whyt3mattr001@db.faigodffxazajzkyzifa.supabase.co:5432/postgres', { ssl: 'require' });
  const migration = fs.readFileSync('d:/pacy_labs/dreamfield/supabase/migrations/20260724000000_init_orders.sql', 'utf8');
  try {
    await sql.unsafe(migration);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await sql.end();
  }
}
run();
