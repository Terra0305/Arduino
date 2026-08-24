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
const MAX_NAME_LENGTH = 20;
const MAX_FEEDBACK_LENGTH = 2000;

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
    const studentName = (form.get('studentName') || '').trim().replace(/\s+/g, ' ');
    const code = form.get('code') || '';

    const fail = (message) => html(res, student.helpPage({ cls, error: message, code, name: studentName }), 400);
    if (!studentName) return fail('이름을 입력해 주세요!');
    if (studentName.length > MAX_NAME_LENGTH) return fail('이름이 너무 길어요.');
    if (!code.trim()) return fail('코드를 먼저 붙여넣어 주세요!');
    if (code.length > MAX_CODE_LENGTH) return fail('코드가 너무 길어요. 필요한 부분만 붙여넣어 주세요.');

    const { token } = await store.createSubmission({ classId: cls ? cls.id : null, studentName, code });
    return html(res, student.helpDonePage(studentName, token));
  }

  // 학생이 자기 제출과 선생님 답변을 보는 주소. 열쇠를 모르면 열리지 않는다.
  const myMatch = pathname.match(/^\/my\/([0-9a-f]{24})$/);
  if (myMatch && req.method === 'GET') {
    const sub = await store.getSubmissionByToken(myMatch[1]);
    if (!sub) return notFound(res);
    return html(res, student.mySubmissionPage(sub));
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

  const feedbackMatch = pathname.match(/^\/admin\/submissions\/(\d+)\/feedback$/);
  if (feedbackMatch && req.method === 'POST') {
    const id = Number(feedbackMatch[1]);
    const form = await readForm(req);
    const feedback = (form.get('feedback') || '').trim().slice(0, MAX_FEEDBACK_LENGTH);
    const sub = await store.getSubmission(id);
    if (!sub) return notFound(res);
    if (!feedback) {
      return html(res, admin.submissionPage(sub, '학생에게 남길 말을 적어주세요.'), 400);
    }
    await store.saveFeedback(id, feedback);
    return redirect(res, '/admin');
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
    if (err?.message === 'NO_DATABASE' || err?.message === 'BAD_DATABASE_URL') {
      console.error(
        err.message === 'NO_DATABASE'
          ? 'Postgres 접속 주소를 찾을 수 없습니다. Vercel 의 Storage 에서 DB 를 연결하세요.'
          : 'Postgres 접속 주소의 형식이 올바르지 않습니다 (postgresql://사용자:비밀번호@호스트/DB 형태).',
      );
      return html(res, student.setupPage(err.message === 'BAD_DATABASE_URL'), 503);
    }
    console.error(err);
    if (!res.headersSent) html(res, student.errorPage('문제가 생겼어요. 잠시 후 다시 시도해 주세요.'), 500);
  }
}
