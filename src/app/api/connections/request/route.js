import { getDb } from '@/lib/db';

export async function POST(request) {
  const sql = getDb();

  try {
    const { requesterId, recipientId } = await request.json();

    if (!requesterId || !recipientId) {
      return new Response(
        JSON.stringify({ error: 'requesterId and recipientId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (requesterId === recipientId) {
      return new Response(
        JSON.stringify({ error: 'Cannot send connection request to yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create connection request
    const result = await sql`
      INSERT INTO colab_connections (requester_id, recipient_id, status)
      VALUES (${requesterId}, ${recipientId}, 'pending')
      ON CONFLICT (requester_id, recipient_id) DO NOTHING
      RETURNING *;
    `;

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Connection request already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, connection: result[0] }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating connection request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create connection request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
