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

async function checkAndUpdateProfiles() {
  const sql = neon(envVars.DATABASE_URL);

  try {
    // First, check current state
    console.log('Checking current profile data...\n');

    const allProfiles = await sql`SELECT user_id, name, email, password FROM colab_profiles`;

    console.log(`Total profiles: ${allProfiles.length}\n`);

    let nullNameCount = 0;
    let nullEmailCount = 0;
    let nullPasswordCount = 0;

    allProfiles.forEach(profile => {
      if (!profile.name) nullNameCount++;
      if (!profile.email) nullEmailCount++;
      if (!profile.password) nullPasswordCount++;

      if (!profile.name || !profile.email || !profile.password) {
        console.log(`Profile ${profile.user_id}:`);
        console.log(`  - name: ${profile.name || 'NULL'}`);
        console.log(`  - email: ${profile.email || 'NULL'}`);
        console.log(`  - password: ${profile.password ? 'SET' : 'NULL'}`);
        console.log('');
      }
    });

    console.log(`Profiles with null name: ${nullNameCount}`);
    console.log(`Profiles with null email: ${nullEmailCount}`);
    console.log(`Profiles with null password: ${nullPasswordCount}\n`);

    if (nullNameCount === 0 && nullEmailCount === 0 && nullPasswordCount === 0) {
      console.log('✓ All profiles have name, email, and password set!');
      return;
    }

    // Update profiles with missing data
    console.log('Updating profiles with missing data...\n');

    for (const profile of allProfiles) {
      const updates = {};
      let needsUpdate = false;

      // Generate name from user_id if missing
      if (!profile.name) {
        updates.name = profile.user_id.split('-')[0];
        needsUpdate = true;
      }

      // Generate email from user_id if missing
      if (!profile.email) {
        updates.email = `${profile.user_id.split('-')[0]}@example.edu`;
        needsUpdate = true;
      }

      // Set a default password if missing (users will need to reset)
      if (!profile.password) {
        updates.password = 'changeMe123';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await sql`
          UPDATE colab_profiles
          SET
            name = COALESCE(${updates.name || null}, name),
            email = COALESCE(${updates.email || null}, email),
            password = COALESCE(${updates.password || null}, password),
            updated_at = NOW()
          WHERE user_id = ${profile.user_id}
        `;

        console.log(`✓ Updated ${profile.user_id}:`);
        if (updates.name) console.log(`  - Set name: ${updates.name}`);
        if (updates.email) console.log(`  - Set email: ${updates.email}`);
        if (updates.password) console.log(`  - Set password: ${updates.password}`);
        console.log('');
      }
    }

    // Verify updates
    console.log('Verifying all profiles now have required fields...\n');

    const updatedProfiles = await sql`
      SELECT user_id, name, email, password
      FROM colab_profiles
      WHERE name IS NULL OR email IS NULL OR password IS NULL
    `;

    if (updatedProfiles.length === 0) {
      console.log('✓ All profiles now have name, email, and password set!');
    } else {
      console.log(`⚠ Warning: ${updatedProfiles.length} profiles still have null values`);
      updatedProfiles.forEach(p => {
        console.log(`  - ${p.user_id}: name=${p.name || 'NULL'}, email=${p.email || 'NULL'}, password=${p.password ? 'SET' : 'NULL'}`);
      });
    }

  } catch (error) {
    console.error('Error updating profiles:', error.message);
  }
}

checkAndUpdateProfiles();
