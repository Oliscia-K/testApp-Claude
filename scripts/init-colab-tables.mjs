import { neon } from '@neondatabase/serverless';

async function initTables() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create colab_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS colab_profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT,
        courses TEXT[] DEFAULT '{}',
        interests TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✓ Created colab_profiles table');

    // Create colab_connections table
    await sql`
      CREATE TABLE IF NOT EXISTS colab_connections (
        id SERIAL PRIMARY KEY,
        requester_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(requester_id, recipient_id)
      );
    `;
    console.log('✓ Created colab_connections table');

    // Create colab_messages table
    await sql`
      CREATE TABLE IF NOT EXISTS colab_messages (
        id SERIAL PRIMARY KEY,
        connection_id INTEGER REFERENCES colab_connections(id),
        sender_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✓ Created colab_messages table');

    console.log('\n✅ All Co-Lab tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
    process.exit(1);
  }
}

initTables();
