import { execSync } from 'child_process'
import fs from 'fs'

const dbUrl = process.env.DATABASE_URL
const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
const token = process.env.SUPABASE_ACCESS_TOKEN

if (!dbUrl || !projectId || !token) {
  console.error("Missing required environment variables (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN)")
  process.exit(1)
}

const command = process.argv[2]

if (command === 'push') {
  console.log(`Preparing to push migrations for ${projectId}...`)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch project info: ${res.statusText}`);
    const projectInfo = await res.json();
    const region = projectInfo.region;

    const dbUrlParsed = new URL(dbUrl);
    const password = dbUrlParsed.password;
    const encodedPassword = encodeURIComponent(password);
    const poolerUrl = `postgresql://postgres.${projectId}:${encodedPassword}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
    console.log(`Constructed pooler URL for region ${region} (Session Port 5432)`);

    const migrationsDir = './supabase/migrations';
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        const filePath = `${migrationsDir}/${file}`;
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    }

    console.log(`Pushing migrations to remote database...`);
    execSync(`npx supabase db push --db-url "${poolerUrl}" --yes`, { stdio: 'inherit' });
    console.log("Push successful!");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
} else if (command === 'types') {
  console.log(`Fetching types for ${projectId}...`)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/types/typescript`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Failed to fetch types: ${res.statusText}`);
    const types = await res.text()
    fs.writeFileSync('./src/types/database.types.ts', types)
    console.log("Types written to src/types/database.types.ts")
  } catch (e) {
    console.error("Failed to fetch types:", e);
    process.exit(1);
  }
} else if (command === 'run-sql') {
  // Run a specific SQL file directly via Supabase REST
  const sqlFile = process.argv[3]
  if (!sqlFile) {
    console.error("Usage: node scripts/db.mjs run-sql <path-to-sql-file>")
    process.exit(1)
  }
  let sql = fs.readFileSync(sqlFile, 'utf8')
  if (sql.charCodeAt(0) === 0xFEFF) sql = sql.slice(1)

  console.log(`Running SQL file: ${sqlFile}`)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    })
    const result = await res.text()
    if (!res.ok) {
      console.error("SQL failed:", result)
      process.exit(1)
    }
    console.log("SQL executed successfully!")
    console.log(result)
  } catch (e) {
    console.error("Failed to run SQL:", e)
    process.exit(1)
  }
} else {
  console.log("Usage: node scripts/db.mjs [push|types|run-sql <file>]")
}
