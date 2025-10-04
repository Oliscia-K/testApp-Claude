import { getDb } from '@/lib/db';

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

    // Get current user's profile
    const userProfile = await sql`
      SELECT * FROM colab_profiles WHERE user_id = ${userId};
    `;

    if (userProfile.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userCourses = userProfile[0].courses || [];
    const userInterests = userProfile[0].interests || [];

    // Find matches based on shared courses
    // Using PostgreSQL array overlap operator &&
    const matchesRaw = await sql`
      SELECT
        user_id,
        email,
        courses,
        interests,
        (
          -- Count shared courses (weighted more)
          (SELECT COUNT(*)
           FROM unnest(courses) course
           WHERE course = ANY(${userCourses}::text[])) * 2 +
          -- Count shared interests
          (SELECT COUNT(*)
           FROM unnest(interests) interest
           WHERE interest = ANY(${userInterests}::text[]))
        ) as match_score
      FROM colab_profiles
      WHERE user_id != ${userId}
        AND courses && ${userCourses}::text[]
      ORDER BY match_score DESC, created_at DESC;
    `;

    // Convert match_score to number
    const matches = matchesRaw.map(m => ({
      ...m,
      match_score: parseInt(m.match_score, 10)
    }));

    return new Response(
      JSON.stringify({ matches }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch matches' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
