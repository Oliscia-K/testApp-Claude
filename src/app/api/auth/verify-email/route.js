export async function POST(request) {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if email ends with .edu
  if (!email.toLowerCase().endsWith('.edu')) {
    return new Response(
      JSON.stringify({ error: 'Email must be from an educational institution (.edu)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Email verified' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
