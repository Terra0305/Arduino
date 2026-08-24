const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** HTML 출력에 들어가는 모든 값은 반드시 이 함수를 거친다. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

export function html(res, body, status = 200) {
  send(res, status, body, { 'Content-Type': 'text/html; charset=utf-8' });
}

export function redirect(res, location) {
  send(res, 302, '', { Location: location });
}

const BODY_LIMIT = 12 * 1024 * 1024; // 연결 사진이 data URI 로 들어올 수 있어 넉넉하게 잡는다

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        // 이미 한도를 넘었어도 끝까지 받아서 버린다.
        // 업로드 중에 연결을 끊으면 브라우저가 413 응답을 못 읽는 경우가 있다.
        tooLarge = true;
        chunks.length = 0;
        if (size > BODY_LIMIT * 4) {
          reject(new Error('BODY_TOO_LARGE'));
          req.destroy();
        }
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) reject(new Error('BODY_TOO_LARGE'));
      else resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

export async function readForm(req) {
  return new URLSearchParams(await readBody(req));
}

export function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const SEOUL = { timeZone: 'Asia/Seoul' };

export function timeHHMM(iso) {
  return new Date(iso).toLocaleTimeString('ko-KR', { ...SEOUL, hour: '2-digit', minute: '2-digit', hour12: false });
}

export function dateShort(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', { ...SEOUL, month: 'long', day: 'numeric' });
}
