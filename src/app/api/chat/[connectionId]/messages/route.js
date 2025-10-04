import { getDb } from '@/lib/db';

export async function POST(request, { params }) {
  const sql = getDb();

  try {
    const { connectionId } = params;
    const { senderId, message } = await request.json();

    if (!senderId || !message) {
      return new Response(
        JSON.stringify({ error: 'senderId and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert message
    const result = await sql`
      INSERT INTO colab_messages (connection_id, sender_id, message)
      VALUES (${connectionId}, ${senderId}, ${message})
      RETURNING *;
    `;

    return new Response(
      JSON.stringify({ success: true, message: result[0] }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request, { params }) {
  const sql = getDb();

  try {
    const { connectionId } = params;

    // Get all messages for this connection
    const messages = await sql`
      SELECT * FROM colab_messages
      WHERE connection_id = ${connectionId}
      ORDER BY created_at ASC;
    `;

    return new Response(
      JSON.stringify({ messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch messages' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
