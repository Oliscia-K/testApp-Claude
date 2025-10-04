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
