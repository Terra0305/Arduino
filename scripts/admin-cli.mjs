#!/usr/bin/env node
/**
 * 관리자 화면에서 버튼을 누르면 서버로 보내는 요청을, 사람이 클릭하지 않고
 * 그대로 코드로 보내는 도구. 수업을 만들거나 코드 단계를 공개/숨기는 것을
 * 채팅에서 받은 내용으로 바로 웹에 반영할 때 쓴다.
 *
 * 필요한 환경변수 (프로젝트 루트의 .env 에 넣어두면 자동으로 읽는다):
 *   ADMIN_SITE_URL  대상 주소 (기본값 http://localhost:3000)
 *   ADMIN_PASSWORD  관리자 비밀번호 (필수)
 *
 * 사용법은 이 파일을 인자 없이 실행하면 나온다.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** .env 가 있으면 읽어서 process.env 에 채운다. 이미 넘겨받은 값은 덮어쓰지 않는다. */
async function loadDotEnv() {
  let raw;
  try {
    raw = await readFile(path.join(PROJECT_ROOT, '.env'), 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

await loadDotEnv();

function siteUrl() {
  return (process.env.ADMIN_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function adminPassword() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD 환경변수가 없어요. (.env 에 넣거나 실행할 때 앞에 붙이세요)');
  return pw;
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

let cachedCookie = null;

async function login() {
  if (cachedCookie) return cachedCookie;
  const res = await fetch(`${siteUrl()}/admin/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ password: adminPassword() }),
  });
  const setCookie = res.headers.get('set-cookie');
  if (res.status !== 302 || !setCookie) {
    throw new Error(`로그인 실패 (상태 ${res.status}). 주소나 비밀번호를 확인하세요.`);
  }
  cachedCookie = setCookie.split(';')[0];
  return cachedCookie;
}

async function postForm(path, params) {
  const cookie = await login();
  const res = await fetch(`${siteUrl()}${path}`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie },
    body: params,
  });
  if (res.status === 302) return { ok: true, location: res.headers.get('location') };
  // 성공하면 302로 넘어가고, 실패하면 같은 화면에 에러 문구와 함께 200으로 남는다.
  const html = await res.text();
  const match = html.match(/<p class="error">([\s\S]*?)<\/p>/);
  throw new Error(match ? decodeEntities(match[1]) : `요청 실패 (상태 ${res.status})`);
}

async function getJSON(path) {
  const cookie = await login();
  const res = await fetch(`${siteUrl()}${path}`, { headers: { Cookie: cookie } });
  if (!res.ok) throw new Error(`조회 실패 (상태 ${res.status})`);
  return res.json();
}

/** 수업 하나를 표현하는 spec 객체를, 관리자 폼이 보내는 것과 같은 형태로 바꾼다. */
export function classFormParams(spec) {
  const codes = spec.codes || [];
  if (!codes.length) throw new Error('codes 가 비어 있어요. 코드가 최소 1개는 있어야 해요.');
  const params = new URLSearchParams();
  params.append('title', spec.title || '');
  params.append('description', spec.description || '');
  for (const item of codes) {
    const title = String(item.title || '').trim();
    const code = String(item.code || '');
    if (!title || !code.trim()) {
      throw new Error(`제목과 코드가 모두 있어야 해요: ${JSON.stringify(item.title ?? '')}`);
    }
    params.append('codeTitle', title);
    params.append('code', code);
    // 처음 언급이 없으면 공개로 둔다 — 단계를 나누고 싶을 때만 released:false 를 명시하면 된다.
    params.append('codeReleased', item.released === false ? '0' : '1');
  }
  params.append('materials', (spec.materials || []).join('\n'));
  params.append('wiringImage', spec.wiringImage || '');
  params.append('notice', spec.notice || '');
  if (spec.isCurrent) params.append('isCurrent', '1');
  return params;
}

/** 파일 경로면 읽어서, 아니면 그 자체를 JSON 문자열로 보고 spec 을 만든다. */
export async function loadSpec(pathOrJson) {
  if (!pathOrJson) throw new Error('spec(JSON 파일 경로 또는 JSON 문자열)이 필요해요.');
  let raw;
  try {
    raw = await readFile(pathOrJson, 'utf8');
  } catch {
    raw = pathOrJson;
  }
  return JSON.parse(raw);
}

const USAGE = `사용법:
  admin-cli.mjs list
  admin-cli.mjs create <spec.json 경로 또는 JSON 문자열>
  admin-cli.mjs update <classId> <spec.json 경로 또는 JSON 문자열>
  admin-cli.mjs current <classId>
  admin-cli.mjs release-next <classId>
  admin-cli.mjs release <classId> <codeIndex> <0|1>
  admin-cli.mjs release-all <classId> <0|1>

환경변수: ADMIN_SITE_URL (기본 http://localhost:3000), ADMIN_PASSWORD (필수)

spec 형태:
{
  "title": "LED 켜기",
  "description": "단계별로 LED를 켭니다",
  "materials": ["Arduino UNO", "LED"],
  "notice": "",
  "isCurrent": true,
  "codes": [
    { "title": "1단계 · LED 켜기", "code": "...", "released": true },
    { "title": "2단계 · 깜빡이기", "code": "...", "released": false }
  ]
}`;

export async function run(argv) {
  const [cmd, ...args] = argv;

  if (cmd === 'list') {
    const classes = await getJSON('/admin/classes.json');
    if (!classes.length) return '수업이 없어요.';
    return classes
      .map((c) => {
        const shown = c.codes.filter((x) => x.released).length;
        return `#${c.id}  ${c.isCurrent ? '★현재' : '　　'}  ${c.title}  (코드 ${shown}/${c.codes.length} 공개)`;
      })
      .join('\n');
  }

  if (cmd === 'create') {
    const spec = await loadSpec(args[0]);
    const result = await postForm('/admin/classes', classFormParams(spec));
    return `만들었어요 → ${result.location}`;
  }

  if (cmd === 'update') {
    const [id, specArg] = args;
    if (!id) throw new Error('classId 가 필요해요.');
    const spec = await loadSpec(specArg);
    const result = await postForm(`/admin/classes/${id}`, classFormParams(spec));
    return `수정했어요 → ${result.location}`;
  }

  if (cmd === 'current') {
    const [id] = args;
    if (!id) throw new Error('classId 가 필요해요.');
    await postForm(`/admin/classes/${id}/current`, new URLSearchParams());
    return `#${id} 를 현재 수업으로 지정했어요.`;
  }

  if (cmd === 'release-next') {
    const [id] = args;
    if (!id) throw new Error('classId 가 필요해요.');
    await postForm(`/admin/classes/${id}/codes/next`, new URLSearchParams());
    return `#${id} 의 다음 단계를 공개했어요.`;
  }

  if (cmd === 'release') {
    const [id, index, on] = args;
    if (!id || index === undefined || (on !== '0' && on !== '1')) {
      throw new Error('release <classId> <codeIndex> <0|1> 형태로 주세요.');
    }
    await postForm(`/admin/classes/${id}/codes/${index}/release`, new URLSearchParams({ released: on }));
    return `#${id} 코드 ${index}번을 ${on === '1' ? '공개' : '숨김'}으로 바꿨어요.`;
  }

  if (cmd === 'release-all') {
    const [id, on] = args;
    if (!id || (on !== '0' && on !== '1')) throw new Error('release-all <classId> <0|1> 형태로 주세요.');
    await postForm(`/admin/classes/${id}/codes/all`, new URLSearchParams({ released: on }));
    return on === '1' ? `#${id} 모두 공개했어요.` : `#${id} 처음 상태(첫 코드만 공개)로 되돌렸어요.`;
  }

  return USAGE;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  run(process.argv.slice(2)).then(
    (message) => console.log(message),
    (err) => {
      console.error('오류:', err.message);
      process.exit(1);
    },
  );
}
