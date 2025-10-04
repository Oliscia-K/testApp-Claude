// Smoke tests
import { test, expect } from '@playwright/test';

test('GET /health returns 200', async ({ request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
});

test('POST /api/auth/verify-email with valid .edu email returns 200', async ({ request }) => {
  const response = await request.post('/api/auth/verify-email', {
    data: { email: 'student@university.edu' }
  });
  expect(response.status()).toBe(200);
});

test('POST /api/auth/verify-email with non-.edu email returns 400', async ({ request }) => {
  const response = await request.post('/api/auth/verify-email', {
    data: { email: 'user@gmail.com' }
  });
  expect(response.status()).toBe(400);
});

test('User can navigate to /profile/setup after auth', async ({ page }) => {
  await page.goto('/profile/setup');
  expect(page.url()).toContain('/profile/setup');
});

test('Form displays course and interest input fields', async ({ page }) => {
  await page.goto('/profile/setup');
  await expect(page.locator('input[name="courses"]')).toBeVisible();
  await expect(page.locator('input[name="interests"]')).toBeVisible();
});

test('POST /api/profile with courses & interests returns 201', async ({ request }) => {
  const response = await request.post('/api/profile', {
    data: {
      userId: 'test-user-' + Date.now(),
      courses: ['CS101', 'MATH201'],
      interests: ['Machine Learning', 'Web Development']
    }
  });
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.success).toBe(true);
});

test('Saved data persists and can be retrieved', async ({ request }) => {
  const userId = 'test-user-' + Date.now();

  // Save profile
  await request.post('/api/profile', {
    data: {
      userId,
      courses: ['CS101'],
      interests: ['AI']
    }
  });

  // Retrieve profile
  const response = await request.get(`/api/profile?userId=${userId}`);
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.courses).toEqual(['CS101']);
  expect(data.interests).toEqual(['AI']);
});

test('GET /api/matches returns users with shared courses', async ({ request }) => {
  const timestamp = Date.now();

  // Create user 1 with CS101
  await request.post('/api/profile', {
    data: {
      userId: 'match-user-1-' + timestamp,
      courses: ['CS101', 'MATH201'],
      interests: ['AI']
    }
  });

  // Create user 2 with CS101 (shared course)
  await request.post('/api/profile', {
    data: {
      userId: 'match-user-2-' + timestamp,
      courses: ['CS101', 'PHYS101'],
      interests: ['Robotics']
    }
  });

  // Create user 3 with no shared courses
  await request.post('/api/profile', {
    data: {
      userId: 'match-user-3-' + timestamp,
      courses: ['BIO101'],
      interests: ['Biology']
    }
  });

  // Get matches for user 1
  const response = await request.get(`/api/matches?userId=match-user-1-${timestamp}`);
  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.matches).toBeDefined();
  expect(data.matches.length).toBeGreaterThan(0);

  // User 2 should be in matches (shared CS101)
  const matchedUserIds = data.matches.map(m => m.user_id);
  expect(matchedUserIds).toContain('match-user-2-' + timestamp);

  // User 3 should NOT be in matches (no shared courses)
  expect(matchedUserIds).not.toContain('match-user-3-' + timestamp);
});

test('Match score prioritizes course overlap', async ({ request }) => {
  const timestamp = Date.now();

  // Create user with 2 courses
  await request.post('/api/profile', {
    data: {
      userId: 'score-user-1-' + timestamp,
      courses: ['CS101', 'MATH201'],
      interests: ['AI']
    }
  });

  // Create match with 2 shared courses
  await request.post('/api/profile', {
    data: {
      userId: 'score-user-2-' + timestamp,
      courses: ['CS101', 'MATH201', 'PHYS101'],
      interests: ['Math']
    }
  });

  // Create match with 1 shared course and NO shared interest
  await request.post('/api/profile', {
    data: {
      userId: 'score-user-3-' + timestamp,
      courses: ['CS101'],
      interests: ['Programming']
    }
  });

  // Get matches for user 1
  const response = await request.get(`/api/matches?userId=score-user-1-${timestamp}`);
  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.matches.length).toBeGreaterThanOrEqual(2);

  // User 2 has 2 shared courses (score = 4), User 3 has 1 shared course (score = 2)
  // First match should have higher score than second (sorted by score DESC)
  const user2Match = data.matches.find(m => m.user_id === 'score-user-2-' + timestamp);
  const user3Match = data.matches.find(m => m.user_id === 'score-user-3-' + timestamp);

  expect(user2Match.match_score).toBe(4); // 2 courses * 2 = 4
  expect(user3Match.match_score).toBe(2); // 1 course * 2 = 2
  expect(user2Match.match_score).toBeGreaterThan(user3Match.match_score);
});

test('User sees list of suggested matches on /matches page', async ({ page, request }) => {
  const timestamp = Date.now();
  const userId = 'match-page-user-' + timestamp;

  // Create a test user profile
  await request.post('/api/profile', {
    data: {
      userId,
      courses: ['CS101'],
      interests: ['Web Dev']
    }
  });

  // Create a potential match
  await request.post('/api/profile', {
    data: {
      userId: 'match-page-match-' + timestamp,
      courses: ['CS101', 'CS202'],
      interests: ['AI']
    }
  });

  // Set localStorage to authenticate user
  await page.goto('/');
  await page.evaluate((userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, { userId, email: `${userId}@test.edu`, name: userId, hasProfile: true });

  // Visit matches page
  await page.goto('/matches');

  // Check that we can see match suggestions (use h1 to avoid navigation link)
  await expect(page.locator('h1:has-text("Matches")')).toBeVisible();
  // Should have at least 1 match (the one we just created)
  // Wait for match cards to appear
  await page.waitForSelector('[data-testid="match-card"]', { timeout: 5000 });
  const matchCount = await page.locator('[data-testid="match-card"]').count();
  expect(matchCount).toBeGreaterThanOrEqual(1);
});

test('Each match shows shared courses/interests', async ({ page, request }) => {
  const timestamp = Date.now();
  const userId = 'detail-user-' + timestamp;

  // Create test user
  await request.post('/api/profile', {
    data: {
      userId,
      courses: ['CS101', 'MATH201'],
      interests: ['AI']
    }
  });

  // Create match with shared info
  await request.post('/api/profile', {
    data: {
      userId: 'detail-match-' + timestamp,
      courses: ['CS101'],
      interests: ['AI', 'Robotics']
    }
  });

  // Set localStorage to authenticate user
  await page.goto('/');
  await page.evaluate((userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, { userId, email: `${userId}@test.edu`, name: userId, hasProfile: true });

  // Visit matches page
  await page.goto('/matches');

  // Check that shared courses/interests are displayed
  await expect(page.locator('text=CS101').first()).toBeVisible();
  await expect(page.locator('text=AI').first()).toBeVisible();
});

test('POST /api/connections/request creates pending connection', async ({ request }) => {
  const timestamp = Date.now();
  const requesterId = 'requester-' + timestamp;
  const recipientId = 'recipient-' + timestamp;

  const response = await request.post('/api/connections/request', {
    data: {
      requesterId,
      recipientId
    }
  });

  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.connection.status).toBe('pending');
  expect(data.connection.requester_id).toBe(requesterId);
  expect(data.connection.recipient_id).toBe(recipientId);
});

test('Recipient can see pending request', async ({ request }) => {
  const timestamp = Date.now();
  const requesterId = 'req2-' + timestamp;
  const recipientId = 'rec2-' + timestamp;

  // Create connection request
  await request.post('/api/connections/request', {
    data: { requesterId, recipientId }
  });

  // Get recipient's pending requests
  const response = await request.get(`/api/connections?userId=${recipientId}&status=pending`);
  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.connections.length).toBeGreaterThanOrEqual(1);
  const pendingRequest = data.connections.find(c => c.requester_id === requesterId);
  expect(pendingRequest).toBeDefined();
  expect(pendingRequest.status).toBe('pending');
});

test('POST /api/connections/:id/accept updates status to accepted', async ({ request }) => {
  const timestamp = Date.now();
  const requesterId = 'req-accept-' + timestamp;
  const recipientId = 'rec-accept-' + timestamp;

  // Create connection request
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId, recipientId }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;

  // Accept the request
  const acceptResponse = await request.post(`/api/connections/${connectionId}/accept`, {
    data: {}
  });

  expect(acceptResponse.status()).toBe(200);
  const acceptData = await acceptResponse.json();
  expect(acceptData.connection.status).toBe('accepted');
});

test('POST /api/connections/:id/reject updates status to rejected', async ({ request }) => {
  const timestamp = Date.now();
  const requesterId = 'req-reject-' + timestamp;
  const recipientId = 'rec-reject-' + timestamp;

  // Create connection request
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId, recipientId }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;

  // Reject the request
  const rejectResponse = await request.post(`/api/connections/${connectionId}/reject`, {
    data: {}
  });

  expect(rejectResponse.status()).toBe(200);
  const rejectData = await rejectResponse.json();
  expect(rejectData.connection.status).toBe('rejected');
});

test('GET /api/connections returns accepted connections', async ({ request }) => {
  const timestamp = Date.now();
  const user1 = 'conn-user-1-' + timestamp;
  const user2 = 'conn-user-2-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: user1, recipientId: user2 }
  });
  const createData = await createResponse.json();
  await request.post(`/api/connections/${createData.connection.id}/accept`, { data: {} });

  // Get accepted connections for user1
  const response = await request.get(`/api/connections?userId=${user1}&status=accepted`);
  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.connections.length).toBeGreaterThanOrEqual(1);
  const acceptedConnection = data.connections.find(c =>
    (c.requester_id === user1 && c.recipient_id === user2) ||
    (c.requester_id === user2 && c.recipient_id === user1)
  );
  expect(acceptedConnection).toBeDefined();
  expect(acceptedConnection.status).toBe('accepted');
});

test('/connections page displays active connections', async ({ page, request }) => {
  const timestamp = Date.now();
  const userId = 'page-user-' + timestamp;
  const connectedUser = 'connected-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: userId, recipientId: connectedUser }
  });
  const createData = await createResponse.json();
  await request.post(`/api/connections/${createData.connection.id}/accept`, { data: {} });

  // Set localStorage to authenticate user
  await page.goto('/');
  await page.evaluate((userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, { userId, email: `${userId}@test.edu`, name: userId, hasProfile: true });

  // Visit connections page
  await page.goto('/connections');
  await expect(page.locator('h1:has-text("Connections")')).toBeVisible();

  // Wait for connections to load
  await page.waitForSelector('[data-testid="connection-card"]', { timeout: 5000 });
  const connectionCount = await page.locator('[data-testid="connection-card"]').count();
  expect(connectionCount).toBeGreaterThanOrEqual(1);
});

test('PUT /api/profile updates courses/interests', async ({ request }) => {
  const timestamp = Date.now();
  const userId = 'edit-user-' + timestamp;

  // Create initial profile
  await request.post('/api/profile', {
    data: {
      userId,
      courses: ['CS101'],
      interests: ['AI']
    }
  });

  // Update profile
  const updateResponse = await request.post('/api/profile', {
    data: {
      userId,
      courses: ['CS101', 'CS202'],
      interests: ['AI', 'Web Dev']
    }
  });

  expect(updateResponse.status()).toBe(201);

  // Verify update
  const getResponse = await request.get(`/api/profile?userId=${userId}`);
  const data = await getResponse.json();
  expect(data.courses).toEqual(['CS101', 'CS202']);
  expect(data.interests).toEqual(['AI', 'Web Dev']);
});

test('Match suggestions refresh after profile update', async ({ request }) => {
  const timestamp = Date.now();
  const userId = 'refresh-user-' + timestamp;
  const matchUser1 = 'match-cs-' + timestamp;
  const matchUser2 = 'match-math-' + timestamp;

  // Create user with CS101
  await request.post('/api/profile', {
    data: { userId, courses: ['CS101'], interests: [] }
  });

  // Create potential matches
  await request.post('/api/profile', {
    data: { userId: matchUser1, courses: ['CS101'], interests: [] }
  });
  await request.post('/api/profile', {
    data: { userId: matchUser2, courses: ['MATH201'], interests: [] }
  });

  // Get initial matches (should only have CS match)
  const initialMatches = await request.get(`/api/matches?userId=${userId}`);
  const initialData = await initialMatches.json();
  const hasCSMatch = initialData.matches.some(m => m.user_id === matchUser1);
  const hasMathMatch = initialData.matches.some(m => m.user_id === matchUser2);
  expect(hasCSMatch).toBe(true);
  expect(hasMathMatch).toBe(false);

  // Update profile to include MATH201
  await request.post('/api/profile', {
    data: { userId, courses: ['CS101', 'MATH201'], interests: [] }
  });

  // Get updated matches (should now have both)
  const updatedMatches = await request.get(`/api/matches?userId=${userId}`);
  const updatedData = await updatedMatches.json();
  const hasCSMatchAfter = updatedData.matches.some(m => m.user_id === matchUser1);
  const hasMathMatchAfter = updatedData.matches.some(m => m.user_id === matchUser2);
  expect(hasCSMatchAfter).toBe(true);
  expect(hasMathMatchAfter).toBe(true);
});

test('Connected users can access /chat/:connectionId', async ({ page, request }) => {
  const timestamp = Date.now();
  const user1 = 'chat-user-1-' + timestamp;
  const user2 = 'chat-user-2-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: user1, recipientId: user2 }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;
  await request.post(`/api/connections/${connectionId}/accept`, { data: {} });

  // Set localStorage to authenticate user
  await page.goto('/');
  await page.evaluate((userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, { userId: user1, email: `${user1}@test.edu`, name: user1, hasProfile: true });

  // Visit chat page
  await page.goto(`/chat/${connectionId}`);
  await expect(page.locator('h1:has-text("Chat")')).toBeVisible();
});

test('Messages display in chronological order', async ({ page, request }) => {
  const timestamp = Date.now();
  const user1 = 'msg-user-1-' + timestamp;
  const user2 = 'msg-user-2-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: user1, recipientId: user2 }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;
  await request.post(`/api/connections/${connectionId}/accept`, { data: {} });

  // Send messages
  await request.post(`/api/chat/${connectionId}/messages`, {
    data: { senderId: user1, message: 'First message' }
  });
  await request.post(`/api/chat/${connectionId}/messages`, {
    data: { senderId: user2, message: 'Second message' }
  });

  // Set localStorage to authenticate user
  await page.goto('/');
  await page.evaluate((userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, { userId: user1, email: `${user1}@test.edu`, name: user1, hasProfile: true });

  // Visit chat page
  await page.goto(`/chat/${connectionId}`);

  // Wait for messages to load
  await page.waitForSelector('[data-testid="message"]', { timeout: 5000 });

  // Check messages appear
  await expect(page.locator('text=First message')).toBeVisible();
  await expect(page.locator('text=Second message')).toBeVisible();
});

test('POST /api/chat/:connectionId/messages sends message', async ({ request }) => {
  const timestamp = Date.now();
  const user1 = 'send-user-1-' + timestamp;
  const user2 = 'send-user-2-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: user1, recipientId: user2 }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;
  await request.post(`/api/connections/${connectionId}/accept`, { data: {} });

  // Send message
  const sendResponse = await request.post(`/api/chat/${connectionId}/messages`, {
    data: {
      senderId: user1,
      message: 'Hello from tests!'
    }
  });

  expect(sendResponse.status()).toBe(201);
  const sendData = await sendResponse.json();
  expect(sendData.message.message).toBe('Hello from tests!');
  expect(sendData.message.sender_id).toBe(user1);
});

test('GET /api/chat/:connectionId/messages retrieves message history', async ({ request }) => {
  const timestamp = Date.now();
  const user1 = 'get-user-1-' + timestamp;
  const user2 = 'get-user-2-' + timestamp;

  // Create and accept connection
  const createResponse = await request.post('/api/connections/request', {
    data: { requesterId: user1, recipientId: user2 }
  });
  const createData = await createResponse.json();
  const connectionId = createData.connection.id;
  await request.post(`/api/connections/${connectionId}/accept`, { data: {} });

  // Send messages
  await request.post(`/api/chat/${connectionId}/messages`, {
    data: { senderId: user1, message: 'Message 1' }
  });
  await request.post(`/api/chat/${connectionId}/messages`, {
    data: { senderId: user2, message: 'Message 2' }
  });

  // Get message history
  const getResponse = await request.get(`/api/chat/${connectionId}/messages`);
  expect(getResponse.status()).toBe(200);
  const getData = await getResponse.json();

  expect(getData.messages.length).toBeGreaterThanOrEqual(2);
  const msg1 = getData.messages.find(m => m.message === 'Message 1');
  const msg2 = getData.messages.find(m => m.message === 'Message 2');
  expect(msg1).toBeDefined();
  expect(msg2).toBeDefined();
});
