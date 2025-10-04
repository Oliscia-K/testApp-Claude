import { getDb } from '@/lib/db';

export async function GET(request) {
  const sql = getDb();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let connections;

    if (status) {
      // Get connections with specific status and join with user names
      connections = await sql`
        SELECT
          c.*,
          r.name as requester_name,
          rec.name as recipient_name
        FROM colab_connections c
        LEFT JOIN colab_profiles r ON c.requester_id = r.user_id
        LEFT JOIN colab_profiles rec ON c.recipient_id = rec.user_id
        WHERE (c.requester_id = ${userId} OR c.recipient_id = ${userId})
          AND c.status = ${status}
        ORDER BY c.created_at DESC;
      `;
    } else {
      // Get all connections and join with user names
      connections = await sql`
        SELECT
          c.*,
          r.name as requester_name,
          rec.name as recipient_name
        FROM colab_connections c
        LEFT JOIN colab_profiles r ON c.requester_id = r.user_id
        LEFT JOIN colab_profiles rec ON c.recipient_id = rec.user_id
        WHERE c.requester_id = ${userId} OR c.recipient_id = ${userId}
        ORDER BY c.created_at DESC;
      `;
    }

    return new Response(
      JSON.stringify({ connections }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching connections:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch connections' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
