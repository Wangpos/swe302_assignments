import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },     // Ramp up
    { duration: '30m', target: 50 },    // Stay at load for 30 minutes (reduced from 3 hours for assignment)
    { duration: '2m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Realistic user behavior
  const articlesResponse = http.get(`${BASE_URL}/articles`);
  check(articlesResponse, {
    'articles status is 200': (r) => r.status === 200,
    'articles response time OK': (r) => r.timings.duration < 1000,
  });
  sleep(3);

  const tagsResponse = http.get(`${BASE_URL}/tags`);
  check(tagsResponse, {
    'tags status is 200': (r) => r.status === 200,
    'tags response time OK': (r) => r.timings.duration < 500,
  });
  sleep(2);
  
  // Simulate reading an article
  sleep(5);
}
