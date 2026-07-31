const { Client } = require('pg');
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // Check if type column exists
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'menu_categories' AND column_name = 'type'");
    if (res.rows.length === 0) {
      await client.query("ALTER TABLE menu_categories ADD COLUMN type text DEFAULT 'kitchen'");
      
      // Update existing categories based on known names to classify them as bar
      await client.query(`
        UPDATE menu_categories 
        SET type = 'bar' 
        WHERE name ILIKE '%beer%' OR name ILIKE '%liquor%' OR name ILIKE '%wine%' OR name ILIKE '%cocktail%' OR name ILIKE '%drink%' OR name ILIKE '%champagne%'
      `);
      console.log("Added type column and migrated data.");
    } else {
      console.log("type column already exists.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
}
run();
