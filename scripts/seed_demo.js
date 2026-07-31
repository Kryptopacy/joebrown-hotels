const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Demo Data...");

  // 1. Get the hotel
  const { data: hotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id')
    .eq('slug', 'dreamsfield')
    .single();

  if (hotelError || !hotel) {
    console.error("Hotel not found. Error:", hotelError);
    return;
  }

  const hotelId = hotel.id;
  console.log("Found hotel ID:", hotelId);

  // 2. Insert Rooms
  const fallbackRooms = [
    {
      hotel_id: hotelId,
      slug: 'california-executive-suite',
      name: 'California Executive Suite',
      description: 'Spacious modern executive room featuring a plush king-size bed, private lounge area, Smart TV, high-speed Wi-Fi, and 24/7 room service.',
      price_per_night: 45000,
      max_guests: 2,
      size_sqm: 45,
      is_available: true,
      images: ['/images/suite.jpg', '/images/wellness_texture.jpg'],
      amenities: ['Private Lounge Area', '24/7 Room Service', 'King Bed', 'High-Speed Fiber WiFi', 'Smart TV & AC', 'En-Suite Bathroom']
    },
    {
      hotel_id: hotelId,
      slug: 'texas-deluxe-room',
      name: 'Texas Deluxe Room',
      description: 'Comfortably furnished deluxe bedroom with workstation, premium bedding, en-suite bathroom, and air conditioning.',
      price_per_night: 35000,
      max_guests: 2,
      size_sqm: 35,
      is_available: true,
      images: ['/images/hero_suite.jpg', '/images/bungalow_texture.jpg'],
      amenities: ['Workstation Desk', 'Air Conditioning', 'En-Suite Bathroom', 'Smart TV', 'Complimentary Bottled Water']
    },
    {
      hotel_id: hotelId,
      slug: 'florida-lounge-suite',
      name: 'Florida Lounge Suite',
      description: 'Atmospheric room designed for relaxing stays, equipped with double bed, lounge seating, mini bar, and direct intercom service.',
      price_per_night: 40000,
      max_guests: 2,
      size_sqm: 40,
      is_available: true,
      images: ['/images/presidential_villa.jpg', '/images/lounge_texture.jpg'],
      amenities: ['Lounge Seating', 'Mini Bar', 'VIP Express Check-in', 'Smart Lighting & Audio']
    }
  ];

  console.log("Inserting rooms...");
  for (const room of fallbackRooms) {
    const { data: existingRoom } = await supabase.from('rooms').select('id').eq('hotel_id', hotelId).eq('slug', room.slug).maybeSingle();
    if (!existingRoom) {
      const { error } = await supabase.from('rooms').insert(room);
      if (error) console.error("Error inserting room:", room.slug, error);
    }
  }

  // 3. Insert Categories
  const categories = [
    { hotel_id: hotelId, name: 'Starters & Grills', display_order: 1 },
    { hotel_id: hotelId, name: 'Main Dishes & Swallows', display_order: 2 },
    { hotel_id: hotelId, name: 'Beers & Ciders', display_order: 3 },
    { hotel_id: hotelId, name: 'Liquors & Cognac', display_order: 4 },
    { hotel_id: hotelId, name: 'Wines & Champagnes', display_order: 5 },
    { hotel_id: hotelId, name: 'Cocktails & Mocktails', display_order: 6 },
    { hotel_id: hotelId, name: 'Soft Drinks & Water', display_order: 7 },
  ];

  console.log("Inserting categories...");
  const catMap = {}; // name -> id
  for (const cat of categories) {
    let { data: existingCat } = await supabase.from('menu_categories').select('id, name').eq('hotel_id', hotelId).eq('name', cat.name).maybeSingle();
    if (!existingCat) {
       const { data: newCat, error } = await supabase.from('menu_categories').insert(cat).select('id, name').single();
       if (error) console.error("Error inserting category:", cat.name, error);
       existingCat = newCat;
    }
    if (existingCat) {
       catMap[existingCat.name] = existingCat.id;
    }
  }

  // 4. Insert Menu Items
  const items = [
    { category_id: catMap['Starters & Grills'], hotel_id: hotelId, name: 'Special Beef Suya Platter', description: 'Tender spicy grilled beef suya served with fresh onions, cabbage, and pepper.', price: 8500, is_available: true },
    { category_id: catMap['Main Dishes & Swallows'], hotel_id: hotelId, name: 'Grilled Croaker Fish & Chips', description: 'Whole grilled seasoned croaker fish served with fried yam or potato chips and spicy pepper sauce.', price: 18000, is_available: true },
    { category_id: catMap['Main Dishes & Swallows'], hotel_id: hotelId, name: 'Special Fried Rice & Chicken', description: 'Rich Nigerian fried rice with fried chicken, plantain, and fresh salad.', price: 6500, is_available: true },
    { category_id: catMap['Beers & Ciders'], hotel_id: hotelId, name: 'Heineken Ice Cold (330ml)', description: 'Chilled premium lager beer bottle.', price: 2500, is_available: true },
    { category_id: catMap['Beers & Ciders'], hotel_id: hotelId, name: 'Guinness Stout (Big Bottle)', description: 'Chilled dark stout brewed with roasted barley.', price: 2500, is_available: true },
    { category_id: catMap['Beers & Ciders'], hotel_id: hotelId, name: 'Trophy Lager Beer', description: 'Crisp cold trophy beer.', price: 2000, is_available: true },
    { category_id: catMap['Liquors & Cognac'], hotel_id: hotelId, name: 'Hennessy VSOP (Full Bottle)', description: 'Smooth aged cognac bottle.', price: 180000, is_available: true },
    { category_id: catMap['Liquors & Cognac'], hotel_id: hotelId, name: 'Martell VS Cognac (Shot)', description: 'Rich French cognac. Double shot.', price: 8000, is_available: true },
    { category_id: catMap['Cocktails & Mocktails'], hotel_id: hotelId, name: 'Dreamsfield Special Cocktail', description: 'House cocktail mix with rum, passionfruit, fresh lime, and mint.', price: 6500, is_available: true },
    { category_id: catMap['Cocktails & Mocktails'], hotel_id: hotelId, name: 'Long Island Iced Tea', description: 'Five-spirit cocktail blend with cola and lemon.', price: 7500, is_available: true },
    { category_id: catMap['Soft Drinks & Water'], hotel_id: hotelId, name: 'Coca-Cola / Fanta / Sprite', description: 'Chilled 50cl bottle.', price: 1000, is_available: true },
    { category_id: catMap['Soft Drinks & Water'], hotel_id: hotelId, name: 'Eva Mineral Water (75cl)', description: 'Pure chilled bottled water.', price: 800, is_available: true },
  ];

  console.log("Inserting items...");
  for (const item of items) {
    if (!item.category_id) {
       console.log("Skipping item because category is missing:", item.name);
       continue;
    }
    const { data: existingItem } = await supabase.from('menu_items').select('id').eq('hotel_id', hotelId).eq('name', item.name).maybeSingle();
    if (!existingItem) {
        const { error } = await supabase.from('menu_items').insert(item);
        if (error) console.error("Error inserting item:", item.name, error);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
