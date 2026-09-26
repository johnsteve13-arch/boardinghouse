const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('[DB-INIT] No DATABASE_URL provided. Skipping remote PostgreSQL migration.');
    console.log('[DB-INIT] The API runs locally in in-memory mode with full SEAIT seed data.');
    return;
  }

  console.log('[DB-INIT] Connecting to PostgreSQL / Supabase...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[DB-INIT] Connected! Applying schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('[DB-INIT] Schema applied successfully.');

    console.log('[DB-INIT] Applying seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
    await client.query(seedSql);
    console.log('[DB-INIT] Seed data applied successfully.');
  } catch (err) {
    console.error('[DB-INIT] Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
