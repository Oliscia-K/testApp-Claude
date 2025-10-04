import { getDb } from '@/lib/db';

export async function POST(request, { params }) {
  const sql = getDb();

  try {
    const { id } = params;

    // Update connection status to accepted
    const result = await sql`
      UPDATE colab_connections
      SET status = 'accepted', updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, connection: result[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error accepting connection:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to accept connection' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
