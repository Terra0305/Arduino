import { createHmac, timingSafeEqual } from 'node:crypto';
import { parseCookies } from './http.js';

const COOKIE = 'teacher';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'arduino';
export const USING_DEFAULT_PASSWORD = !process.env.ADMIN_PASSWORD;

// Vercel 은 파일을 저장할 수 없으므로 비밀키를 파일에 두지 않는다.
// SESSION_SECRET 이 없으면 비밀번호에서 만들어 쓴다 — 쿠키 값은 해시라
// 비밀번호를 모르면 만들어낼 수 없고, 서버가 새로 떠도 로그인이 유지된다.
const SECRET = process.env.SESSION_SECRET || `arduino-class:${ADMIN_PASSWORD}`;

function sameString(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function token() {
  return createHmac('sha256', SECRET).update(`admin:${ADMIN_PASSWORD}`).digest('hex');
}

export function checkPassword(input) {
  return sameString(input, ADMIN_PASSWORD);
}

export function isTeacher(req) {
  const value = parseCookies(req)[COOKIE];
  return Boolean(value) && sameString(value, token());
}

export function loginHeaders(req) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? ' Secure;' : '';
  return { 'Set-Cookie': `${COOKIE}=${token()}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=43200` };
}

export function logoutHeaders() {
  return { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` };
}

/** 비밀번호 추측을 늦추기 위한 아주 단순한 시도 횟수 제한. */
const attempts = new Map();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_TRIES = 8;

export function tooManyAttempts(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_TRIES;
}

export function recordFailure(ip) {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) attempts.set(ip, { first: Date.now(), count: 1 });
  else entry.count += 1;
}

export function clearAttempts(ip) {
  attempts.delete(ip);
}
