import { handleRequest } from '../src/app.js';

// Vercel 이 모든 요청을 이 함수로 보낸다 (vercel.json 의 rewrites 참고).
export default async function handler(req, res) {
  await handleRequest(req, res);
}
