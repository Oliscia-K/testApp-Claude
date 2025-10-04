import { neon } from '@neondatabase/serverless';

async function addNameColumn() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`ALTER TABLE colab_profiles ADD COLUMN IF NOT EXISTS name TEXT`;
    console.log('✓ Added name column to colab_profiles');
  } catch (error) {
    console.error('Error adding name column:', error.message);
  }
}

addNameColumn();
