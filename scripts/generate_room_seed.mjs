import fs from 'fs';
import path from 'path';

const publicDir = './public/JB/rooms';
const sqlFilePath = './supabase/migrations/20260726150002_seed_rooms.sql';

const rooms = [
  { slug: 'standard-room', name: 'Standard Room', price: 25000 },
  { slug: 'deluxe-room', name: 'Deluxe Room', price: 45000 },
  { slug: 'executive-suite', name: 'Executive Suite', price: 75000 }
];

const dirs = ['room_type_1', 'room_type_2', 'room_type_3'];
let sql = `
DO $$
DECLARE
  h_id uuid;
BEGIN
  SELECT id INTO h_id FROM hotels WHERE slug = 'joebrown-palace-hotel-and-suites' LIMIT 1;
  IF h_id IS NULL THEN
    RAISE EXCEPTION 'Hotel not found';
  END IF;

`;

for (let i = 0; i < dirs.length; i++) {
  const dirPath = path.join(publicDir, dirs[i]);
  const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
  const imagePaths = files.map(f => `'/JB/rooms/${dirs[i]}/${f}'`).join(', ');
  const room = rooms[i];
  
  sql += `
  INSERT INTO public.rooms (hotel_id, name, slug, description, price_per_night, max_guests, size_sqm, amenities, images, is_available, display_order)
  VALUES (
    h_id, 
    '${room.name}', 
    '${room.slug}', 
    'A beautiful ${room.name.toLowerCase()} featuring modern amenities and comfort.', 
    ${room.price}, 
    2, 
    35, 
    ARRAY['Air Conditioning', 'Free WiFi', 'Flat-screen TV', 'Ensuite Bathroom'], 
    ARRAY[${imagePaths}], 
    true, 
    ${i + 1}
  ) ON CONFLICT (hotel_id, slug) DO NOTHING;
`;
}

sql += `
END;
$$;
`;

fs.writeFileSync(sqlFilePath, sql);
console.log(`Generated SQL at ${sqlFilePath}`);
