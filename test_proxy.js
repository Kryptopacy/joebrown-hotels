const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Authenticate first
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'kryptopacy@gmail.com',
    password: 'Password123!', // wait, they sign in with google, we don't have the password
  });

  console.log('Testing anon query:');
  const { data: anonData, error: anonErr } = await supabase.from('staff_users').select('*');
  console.log('Anon data:', anonData, anonErr?.message);
}
run();
