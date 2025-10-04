import { getDb } from '@/lib/db';

export async function POST(request) {
  const sql = getDb();

  try {
    const { userId, name, courses, interests, email } = await request.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert or update profile
    const result = await sql`
      INSERT INTO colab_profiles (user_id, name, email, courses, interests)
      VALUES (${userId}, ${name || null}, ${email || null}, ${courses || []}, ${interests || []})
      ON CONFLICT (user_id)
      DO UPDATE SET
        name = ${name || null},
        courses = ${courses || []},
        interests = ${interests || []},
        email = ${email || null},
        updated_at = NOW()
      RETURNING *;
    `;

    return new Response(
      JSON.stringify({ success: true, profile: result[0] }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request) {
  const sql = getDb();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await sql`
      SELECT * FROM colab_profiles
      WHERE user_id = ${userId};
    `;

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result[0]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
