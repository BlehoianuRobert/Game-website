import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const healthRes = http.get('http://localhost/health');
  check(healthRes, { 'health status 200': (r) => r.status === 200 });

  const payload = JSON.stringify({ vector: [1, 2, 3, 4, 5] });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const vectorRes = http.post('http://localhost/vector', payload, params);
  check(vectorRes, { 'vector status 200': (r) => r.status === 200 });

  sleep(0.5);
}
