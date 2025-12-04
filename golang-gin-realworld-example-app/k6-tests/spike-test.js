import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Normal load
    { duration: '30s', target: 10 },    // Stable
    { duration: '10s', target: 500 },   // Sudden spike!
    { duration: '3m', target: 500 },    // Stay at spike
    { duration: '10s', target: 10 },    // Back to normal
    { duration: '3m', target: 10 },     // Recovery period
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // Very relaxed during spike
    http_req_failed: ['rate<0.2'],     // Allow 20% errors during spike
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/articles`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response received': (r) => r.body.length > 0,
  });
  
  // Also test a simple endpoint
  const tagsResponse = http.get(`${BASE_URL}/tags`);
  check(tagsResponse, {
    'tags accessible': (r) => r.status === 200,
  });
}
