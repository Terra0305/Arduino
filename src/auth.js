import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseCookies } from './http.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const COOKIE = 'teacher';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'arduino';
export const USING_DEFAULT_PASSWORD = !process.env.ADMIN_PASSWORD;

/** 서버를 다시 켜도 로그인이 유지되도록 비밀키를 파일에 보관한다. */
function loadSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(DATA_DIR, 'secret.key');
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    const secret = randomBytes(32).toString('hex');
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }
}

const SECRET = loadSecret();

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
