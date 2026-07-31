import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
}

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', URL ? URL.substring(0, 40) + '...' : 'MISSING');
console.log('Anon key:', KEY ? KEY.substring(0, 20) + '...' : 'MISSING');

async function query(table, params = '') {
  const res = await fetch(`${URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
  });
  const data = await res.json();
  return data;
}

console.log('\n--- Hotels ---');
const hotels = await query('hotels', 'select=id,name,slug');
console.log(JSON.stringify(hotels, null, 2));

if (hotels.length > 0) {
  const hotelId = hotels[0].id;
  console.log('\n--- Menu Categories (first 5) ---');
  const cats = await query('menu_categories', `select=id,name,type,is_active&hotel_id=eq.${hotelId}&limit=5`);
  console.log(JSON.stringify(cats, null, 2));

  console.log('\n--- Rooms (first 5) ---');
  const rooms = await query('rooms', `select=id,name,slug&hotel_id=eq.${hotelId}&limit=5`);
  console.log(JSON.stringify(rooms, null, 2));
}
