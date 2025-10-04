import { neon } from '@neondatabase/serverless';

async function checkTables() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('Existing tables in database:');
    tables.forEach(row => console.log(`  - ${row.table_name}`));
    console.log(`\nTotal: ${tables.length} tables`);
  } catch (error) {
    console.error('Error checking tables:', error.message);
  }
}

checkTables();
