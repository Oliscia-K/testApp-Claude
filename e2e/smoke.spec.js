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
