import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';
import { login, getAuthHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp up to 50 users
    { duration: '5m', target: 50 },    // Stay at 50 for 5 minutes
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 for 5 minutes
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 for 5 minutes
    { duration: '2m', target: 300 },   // Beyond normal load
    { duration: '5m', target: 300 },   // Stay at peak
    { duration: '5m', target: 0 },     // Ramp down gradually
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // More relaxed threshold
    http_req_failed: ['rate<0.1'],     // Allow up to 10% errors
  },
};

export function setup() {
  // Setup: Create test user and get token
  const loginRes = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    user: {
      email: 'test@example.com',
      password: 'password'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  return { token: loginRes.json('user.token') };
}

export default function (data) {
  // Test most critical endpoints under stress
  const response = http.get(`${BASE_URL}/articles`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time under 2s': (r) => r.timings.duration < 2000,
  });
  
  // Test tags endpoint
  const tagsResponse = http.get(`${BASE_URL}/tags`);
  check(tagsResponse, {
    'tags status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
