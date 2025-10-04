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
      // Get connections with specific status
      connections = await sql`
        SELECT * FROM colab_connections
        WHERE (requester_id = ${userId} OR recipient_id = ${userId})
          AND status = ${status}
        ORDER BY created_at DESC;
      `;
    } else {
      // Get all connections
      connections = await sql`
        SELECT * FROM colab_connections
        WHERE requester_id = ${userId} OR recipient_id = ${userId}
        ORDER BY created_at DESC;
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
