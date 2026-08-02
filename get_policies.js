const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres' });
  await client.connect();

  const tables = [
    'bookings', 'feedback', 'gallery_images', 'guests', 'hotels', 
    'menu_categories', 'menu_items', 'order_items', 'orders', 'rooms', 
    'service_requests', 'staff_users', 'push_subscriptions', 'customer_intercom_messages'
  ];

  try {
    const res = await client.query(`
      SELECT tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = ANY($1)
    `, [tables]);
    
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error fetching policies:', err.message);
  } finally {
    await client.end();
  }
}

run();
