import { getDb } from '@/lib/db';

export async function POST(request) {
  const sql = getDb();

  try {
    const { email } = await request.json();

    if (!email || !email.endsWith('.edu')) {
      return new Response(
        JSON.stringify({ error: 'Valid .edu email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user profile exists
    const existingProfile = await sql`
      SELECT * FROM colab_profiles
      WHERE email = ${email}
      LIMIT 1;
    `;

    if (existingProfile.length > 0) {
      // User exists, return their info
      const profile = existingProfile[0];
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            userId: profile.user_id,
            email: profile.email,
            name: profile.name || profile.user_id,
            hasProfile: true,
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // New user, create userId from email
      const userId = email.split('@')[0] + '-' + Date.now();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            userId,
            email,
            name: email.split('@')[0],
            hasProfile: false,
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
