import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as store from './db.js';
import { html, redirect, send, readForm } from './http.js';
import * as auth from './auth.js';
import * as student from './views/student.js';
import * as admin from './views/admin.js';

// src/app.js 기준으로 항상 <프로젝트>/public 을 가리킨다 (로컬과 Vercel 모두 동일).
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const MAX_CODE_LENGTH = 200_000;

const STATIC_TYPES = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

async function serveStatic(res, pathname) {
  const ext = path.extname(pathname);
  if (!STATIC_TYPES[ext]) return false;
  try {
    const body = await readFile(path.join(PUBLIC_DIR, path.basename(pathname)));
    send(res, 200, body, { 'Content-Type': STATIC_TYPES[ext], 'Cache-Control': 'no-cache' });
    return true;
  } catch {
    return false;
  }
}

function clientIp(req) {
  return (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '?').trim();
}

function notFound(res) {
  html(res, student.errorPage('페이지를 찾을 수 없어요.'), 404);
}

/* ---------------------------------------------------------------- 학생 */

async function handleStudent(req, res, url) {
  const { pathname } = url;

  if (pathname === '/' && req.method === 'GET') {
    const cls = await store.getCurrentClass();
    return html(res, cls ? student.classPage(cls) : student.noClassPage());
  }

  if (pathname === '/classes' && req.method === 'GET') {
    return html(res, student.classListPage(await store.listClasses()));
  }

  const classMatch = pathname.match(/^\/classes\/(\d+)$/);
  if (classMatch && req.method === 'GET') {
    const cls = await store.getClass(Number(classMatch[1]));
    if (!cls) return notFound(res);
    return html(res, student.classPage(cls, { label: cls.isCurrent ? '오늘의 수업' : '지난 수업', showPastLink: false }));
  }

  if (pathname === '/help' && req.method === 'GET') {
    const idParam = url.searchParams.get('classId');
    const cls = (idParam && (await store.getClass(Number(idParam)))) || (await store.getCurrentClass());
    return html(res, student.helpPage({ cls }));
  }

  if (pathname === '/help' && req.method === 'POST') {
    const form = await readForm(req);
    const classIdRaw = form.get('classId');
    const classId = classIdRaw && /^\d+$/.test(classIdRaw) ? Number(classIdRaw) : null;
    const cls = classId ? await store.getClass(classId) : await store.getCurrentClass();
    const seatRaw = (form.get('seatNumber') || '').trim();
    const code = form.get('code') || '';

    const fail = (message) => html(res, student.helpPage({ cls, error: message, code }), 400);
    if (!/^\d{1,3}$/.test(seatRaw) || Number(seatRaw) < 1) return fail('자리 번호를 입력해 주세요!');
    if (!code.trim()) return fail('코드를 먼저 붙여넣어 주세요!');
    if (code.length > MAX_CODE_LENGTH) return fail('코드가 너무 길어요. 필요한 부분만 붙여넣어 주세요.');

    const seatNumber = String(Number(seatRaw));
    await store.createSubmission({ classId: cls ? cls.id : null, seatNumber, code });
    return html(res, student.helpDonePage(seatNumber));
  }

  return notFound(res);
}

/* -------------------------------------------------------------- 관리자 */

function readClassForm(form) {
  const wiringImage = form.get('wiringImage') || '';
  return {
    title: (form.get('title') || '').trim(),
    description: (form.get('description') || '').trim(),
    code: form.get('code') || '',
    materials: (form.get('materials') || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    wiringDescription: form.get('wiringDescription') || '',
    wiringImage: /^data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+$/.test(wiringImage) ? wiringImage : '',
    notice: (form.get('notice') || '').trim(),
    isCurrent: form.get('isCurrent') === '1',
  };
}

async function handleAdmin(req, res, url) {
  const { pathname } = url;
  const ip = clientIp(req);

  if (pathname === '/admin/login' && req.method === 'POST') {
    if (auth.tooManyAttempts(ip)) {
      return html(res, admin.loginPage('잠시 후 다시 시도해 주세요.'), 429);
    }
    const form = await readForm(req);
    if (!auth.checkPassword(form.get('password') || '')) {
      auth.recordFailure(ip);
      return html(res, admin.loginPage('비밀번호가 맞지 않아요.'), 401);
    }
    auth.clearAttempts(ip);
    return send(res, 302, '', { Location: '/admin', ...auth.loginHeaders(req) });
  }

  if (pathname === '/admin/logout' && req.method === 'POST') {
    return send(res, 302, '', { Location: '/admin', ...auth.logoutHeaders() });
  }

  if (!auth.isTeacher(req)) {
    return html(res, admin.loginPage(), 401);
  }

  if (pathname === '/admin' && req.method === 'GET') {
    const all = await store.listSubmissions();
    return html(
      res,
      admin.adminHome({
        current: await store.getCurrentClass(),
        waiting: all.filter((s) => s.status === 'WAITING'),
        recentDone: all.filter((s) => s.status === 'DONE').slice(0, 10),
      }),
    );
  }

  if (pathname === '/admin/classes' && req.method === 'GET') {
    return html(res, admin.classesPage(await store.listClasses()));
  }

  if (pathname === '/admin/classes/new' && req.method === 'GET') {
    return html(res, admin.classFormPage({}));
  }

  if (pathname === '/admin/classes' && req.method === 'POST') {
    const data = readClassForm(await readForm(req));
    if (!data.title) return html(res, admin.classFormPage({ error: '수업 제목을 입력해 주세요.' }), 400);
    await store.createClass(data);
    return redirect(res, '/admin/classes');
  }

  const editMatch = pathname.match(/^\/admin\/classes\/(\d+)\/edit$/);
  if (editMatch && req.method === 'GET') {
    const cls = await store.getClass(Number(editMatch[1]));
    if (!cls) return notFound(res);
    return html(res, admin.classFormPage({ cls }));
  }

  const saveMatch = pathname.match(/^\/admin\/classes\/(\d+)$/);
  if (saveMatch && req.method === 'POST') {
    const id = Number(saveMatch[1]);
    const cls = await store.getClass(id);
    if (!cls) return notFound(res);
    const data = readClassForm(await readForm(req));
    if (!data.title) {
      return html(res, admin.classFormPage({ cls: { ...cls, ...data }, error: '수업 제목을 입력해 주세요.' }), 400);
    }
    await store.updateClass(id, data);
    return redirect(res, '/admin/classes');
  }

  const currentMatch = pathname.match(/^\/admin\/classes\/(\d+)\/current$/);
  if (currentMatch && req.method === 'POST') {
    await store.setCurrentClass(Number(currentMatch[1]));
    return redirect(res, '/admin/classes');
  }

  const deleteClassMatch = pathname.match(/^\/admin\/classes\/(\d+)\/delete$/);
  if (deleteClassMatch && req.method === 'POST') {
    await store.deleteClass(Number(deleteClassMatch[1]));
    return redirect(res, '/admin/classes');
  }

  if (pathname === '/admin/submissions' && req.method === 'GET') {
    return html(res, admin.submissionsPage(await store.listSubmissions()));
  }

  const subMatch = pathname.match(/^\/admin\/submissions\/(\d+)$/);
  if (subMatch && req.method === 'GET') {
    const sub = await store.getSubmission(Number(subMatch[1]));
    if (!sub) return notFound(res);
    return html(res, admin.submissionPage(sub));
  }

  const statusMatch = pathname.match(/^\/admin\/submissions\/(\d+)\/(done|waiting)$/);
  if (statusMatch && req.method === 'POST') {
    await store.setSubmissionStatus(Number(statusMatch[1]), statusMatch[2] === 'done' ? 'DONE' : 'WAITING');
    return redirect(res, '/admin');
  }

  const deleteSubMatch = pathname.match(/^\/admin\/submissions\/(\d+)\/delete$/);
  if (deleteSubMatch && req.method === 'POST') {
    await store.deleteSubmission(Number(deleteSubMatch[1]));
    return redirect(res, '/admin');
  }

  return notFound(res);
}

/* ------------------------------------------------------- 요청 처리 진입점 */

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && (await serveStatic(res, url.pathname))) return;
    await store.ready();
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return await handleAdmin(req, res, url);
    return await handleStudent(req, res, url);
  } catch (err) {
    if (err?.message === 'BODY_TOO_LARGE') {
      if (res.writableEnded) return;
      return send(res, 413, student.errorPage('보낸 내용이 너무 커요. 조금 줄여서 다시 시도해 주세요.'), {
        'Content-Type': 'text/html; charset=utf-8',
        Connection: 'close',
      });
    }
    if (err?.message === 'NO_DATABASE') {
      console.error('DATABASE_URL 환경변수가 없습니다. Vercel 의 Storage 에서 Postgres 를 연결하세요.');
      return html(res, student.setupPage(), 503);
    }
    console.error(err);
    if (!res.headersSent) html(res, student.errorPage('문제가 생겼어요. 잠시 후 다시 시도해 주세요.'), 500);
  }
}
