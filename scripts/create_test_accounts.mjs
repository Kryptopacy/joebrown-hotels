import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAccount(email, password, role) {
  console.log(`Creating account for ${email}...`);
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log(`Auth user ${email} already exists.`);
    } else {
      console.error(`Error creating auth user ${email}:`, authError);
      return;
    }
  } else {
    console.log(`Successfully created auth user for ${email}`);
  }

  // Insert into staff_users
  const { data: staffData, error: staffError } = await supabaseAdmin
    .from('staff_users')
    .upsert({
      email: email,
      role: role,
      status: 'approved'
    }, { onConflict: 'email' })
    .select();

  if (staffError) {
    console.error(`Error adding ${email} to staff_users:`, staffError);
  } else {
    console.log(`Successfully added/updated ${email} in staff_users as ${role}`);
  }
}

async function run() {
  await createAccount('test@joebrownhotels.com', 'TestUser@123', 'developer');
  await createAccount('business@joebrownhotels.com', 'BusinessUser@123', 'super_admin');
  console.log("Done!");
}

run();
