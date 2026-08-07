-- Update hotel amenities and knowledge base defaults to reflect real facilities (no pool/gym; free parking, laundromat, lounge games/pool table)
UPDATE hotels
SET 
  ai_parking_info = COALESCE(NULLIF(ai_parking_info, ''), 'Complimentary secure on-site parking is available for all hotel and lounge guests 24/7.'),
  ai_amenities = 'Complimentary secure parking, on-site guest laundromat, 24-hour security, high-speed WiFi, 24-hour room service, and a stylish restaurant & lounge featuring a championship pool table and lounge games. Note: Joebrown Hotel does NOT have a swimming pool or fitness center/gym.'
WHERE slug = 'joebrown';
