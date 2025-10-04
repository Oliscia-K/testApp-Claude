import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Load .env.local file
const envFile = readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

async function addPasswordColumn() {
  const sql = neon(envVars.DATABASE_URL);

  try {
    await sql`ALTER TABLE colab_profiles ADD COLUMN IF NOT EXISTS password TEXT`;
    console.log('✓ Added password column to colab_profiles');
  } catch (error) {
    console.error('Error adding password column:', error.message);
  }
}

addPasswordColumn();
