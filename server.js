import http from 'node:http';
import { handleRequest } from './src/app.js';
import { USING_DEFAULT_PASSWORD } from './src/auth.js';

// 배포는 Vercel 이 api/index.js 를 실행한다.
// 이 파일은 올리기 전에 내 컴퓨터에서 확인해 볼 때만 쓴다.
const PORT = Number(process.env.PORT) || 3000;

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`학생 화면 : http://localhost:${PORT}/`);
  console.log(`관리자    : http://localhost:${PORT}/admin`);
  if (USING_DEFAULT_PASSWORD) {
    console.log('⚠️ 관리자 비밀번호가 기본값 "arduino" 입니다. ADMIN_PASSWORD 로 바꿔주세요.');
  }
});
