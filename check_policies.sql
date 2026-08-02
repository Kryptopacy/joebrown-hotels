SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'hotels', 'rooms', 'menu_categories', 'staff_users', 'customer_intercom_messages')
ORDER BY tablename, policyname;
