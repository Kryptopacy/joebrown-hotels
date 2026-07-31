import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!dbUrl || !supabaseUrl || !accessToken) {
  console.error('Missing required environment variables (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_ACCESS_TOKEN).');
  process.exit(1);
}

// Extract project ID from Supabase URL (e.g., https://<project_id>.supabase.co)
const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectId = projectIdMatch ? projectIdMatch[1] : null;

if (!projectId) {
  console.error('Could not extract Project ID from NEXT_PUBLIC_SUPABASE_URL.');
  process.exit(1);
}

const action = process.argv[2];

if (action === 'push') {
  console.log('Pushing migrations to remote database...');
  try {
    // Run supabase db push using the pooler URL
    execSync(`npx supabase db push --db-url "${dbUrl}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('Migrations pushed successfully.');
  } catch (error) {
    console.error('Failed to push migrations.', error.message);
    process.exit(1);
  }
} else if (action === 'types') {
  console.log('Fetching latest TypeScript types...');
  
  const typesUrl = `https://api.supabase.com/v1/projects/${projectId}/types/typescript`;
  
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  const req = https.request(typesUrl, options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to fetch types: HTTP ${res.statusCode}`);
      res.resume();
      process.exit(1);
    }
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const typesDir = path.join(__dirname, '../src/types');
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
      }
      const typesPath = path.join(typesDir, 'database.types.ts');
      fs.writeFileSync(typesPath, data, 'utf8');
      console.log(`Types successfully saved to ${typesPath}`);
    });
  });

  req.on('error', (e) => {
    console.error('Error fetching types:', e.message);
    process.exit(1);
  });

  req.end();
} else {
  console.log(`
Usage:
  node --env-file=.env.local scripts/db.mjs push   - Pushes pending local migrations to the remote database
  node --env-file=.env.local scripts/db.mjs types  - Fetches and updates TypeScript definitions in src/types/database.types.ts
  `);
}
