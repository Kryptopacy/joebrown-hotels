const postgres = require('postgres');

async function run() {
  const sql = postgres('postgresql://postgres:Whyt3mattr001@db.faigodffxazajzkyzifa.supabase.co:5432/postgres', { ssl: 'require' });
  try {
    await sql.unsafe(`
CREATE OR REPLACE FUNCTION book_room_atomically(
    p_hotel_id uuid,
    p_room_id uuid,
    p_guest_name text,
    p_guest_phone text,
    p_guest_email text,
    p_check_in date,
    p_check_out date,
    p_guests_count integer,
    p_special_requests text,
    p_total_amount numeric,
    p_status text
) RETURNS uuid AS $$
DECLARE
    v_conflict_id uuid;
    v_booking_id uuid;
BEGIN
    PERFORM id FROM rooms WHERE id = p_room_id FOR UPDATE;

    SELECT id INTO v_conflict_id
    FROM bookings
    WHERE room_id = p_room_id
      AND check_in < p_check_out
      AND check_out > p_check_in
      AND status != 'cancelled';

    IF v_conflict_id IS NOT NULL THEN
        RAISE EXCEPTION 'Room is already booked for these dates.';
    END IF;

    INSERT INTO bookings (hotel_id, room_id, guest_name, guest_phone, guest_email, check_in, check_out, guests_count, special_requests, total_price, status)
    VALUES (p_hotel_id, p_room_id, p_guest_name, p_guest_phone, p_guest_email, p_check_in, p_check_out, p_guests_count, p_special_requests, p_total_amount, p_status)
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('Atomic booking function created.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}
run();
