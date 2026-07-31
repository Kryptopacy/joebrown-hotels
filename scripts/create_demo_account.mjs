import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'demo@dreamsfield.com';
  const password = 'DemoAdmin123!';

  console.log(`Creating auth user: ${email}...`);
  // Create user in Auth
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    if (authError.status === 422 || authError.message.includes('already registered')) {
        console.log('User already exists in Auth. Updating password just in case...');
        
        // Find the user ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError) {
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                await supabase.auth.admin.updateUserById(
                    existingUser.id,
                    { password: password }
                );
            }
        }
    } else {
        console.error('Auth Error:', authError);
        return;
    }
  } else {
      console.log('Auth user created successfully.');
  }

  console.log(`Adding ${email} to staff_users table as approved owner...`);
  // Add to staff_users
  const { error: dbError } = await supabase.from('staff_users').upsert({
    email,
    role: 'owner',
    status: 'approved'
  }, { onConflict: 'email' });

  if (dbError) {
    console.error('DB Error:', dbError);
  } else {
    console.log('Demo user successfully seeded and approved in staff_users.');
  }
}

main();
