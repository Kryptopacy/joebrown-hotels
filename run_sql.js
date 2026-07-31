const { execSync } = require('child_process');
const dbUrl = new URL(process.env.DATABASE_URL);
const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
const region = 'eu-west-1';
const poolerUrl = `postgresql://postgres.${projectId}:${dbUrl.password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
execSync(`npx psql -d "${poolerUrl}" -f supabase/migrations/20260731195800_seed_menu_items.sql`, {stdio: 'inherit'});
