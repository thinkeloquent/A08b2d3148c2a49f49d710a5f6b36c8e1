import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/{{APP_NAME}}', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
