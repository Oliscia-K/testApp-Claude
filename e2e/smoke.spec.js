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
