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
const MAX_QUESTION_LENGTH = 500;
const MAX_FEEDBACK_LENGTH = 2000;

const STATIC_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

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
    return html(res, student.classPage(cls, { label: cls.isCurrent ? '오늘의 수업' : '지난 수업' }));
  }

  // 새 코드가 공개됐는지만 확인하는 주소 (학생 화면이 스스로 새로고침할 때 쓴다).
  const codeStateMatch = pathname.match(/^\/classes\/(\d+)\/code-state$/);
  if (codeStateMatch && req.method === 'GET') {
    const cls = await store.getClass(Number(codeStateMatch[1]));
    if (!cls) return send(res, 404, '{}', { 'Content-Type': 'application/json' });
    const released = cls.codes.filter((item) => item.released).length;
    return send(res, 200, JSON.stringify({ released }), { 'Content-Type': 'application/json' });
  }

  // 로그인도 브라우저 기억도 없이 누구나 볼 수 있는 답변판.
  if (pathname === '/answers' && req.method === 'GET') {
    return html(res, student.answersPage(await store.listAnswerBoard()));
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
    const question = (form.get('question') || '').trim();
    const code = form.get('code') || '';

    const fail = (message) =>
      html(res, student.helpPage({ cls, error: message, code, name: studentName, question }), 400);
    if (!studentName) return fail('이름을 입력해 주세요!');
    if (studentName.length > MAX_NAME_LENGTH) return fail('이름이 너무 길어요.');
    if (!question) return fail('어떤 문제가 있는지 짧게 적어 주세요!');
    if (question.length > MAX_QUESTION_LENGTH) return fail('질문이 너무 길어요. 500자 이내로 적어 주세요.');
    if (!code.trim()) return fail('코드를 먼저 붙여넣어 주세요!');
    if (code.length > MAX_CODE_LENGTH) return fail('코드가 너무 길어요. 필요한 부분만 붙여넣어 주세요.');

    const { token } = await store.createSubmission({
      classId: cls ? cls.id : null,
      studentName,
      question,
      code,
    });
    // 제출 완료 화면에서 다시 버튼을 누르게 하지 말고, 답변이 자동으로 나타나는 대기 화면으로 바로 보낸다.
    return redirect(res, `/my/${token}`);
  }

  // 수업 화면 맨 위 알림이 답변 도착 여부만 물어보는 주소.
  const statusMatch = pathname.match(/^\/my\/([0-9a-f]{24})\/status$/);
  if (statusMatch && req.method === 'GET') {
    const sub = await store.getSubmissionByToken(statusMatch[1]);
    if (!sub) return send(res, 404, '{}', { 'Content-Type': 'application/json' });
    return send(res, 200, JSON.stringify({ answered: Boolean(sub.feedback), createdAt: sub.createdAt }), {
      'Content-Type': 'application/json',
    });
  }

  // 브라우저가 기억한 여러 질문을 한 화면에 모을 때 쓰는 카드.
  const cardMatch = pathname.match(/^\/my\/([0-9a-f]{24})\/card$/);
  if (cardMatch && req.method === 'GET') {
    const sub = await store.getSubmissionByToken(cardMatch[1]);
    if (!sub) return send(res, 404, '{}', { 'Content-Type': 'application/json' });
    return send(
      res,
      200,
      JSON.stringify({
        token: sub.token,
        createdAt: sub.createdAt,
        answered: Boolean(sub.feedback),
        html: student.myQuestionCard(sub),
      }),
      { 'Content-Type': 'application/json' },
    );
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
  const codeTitles = form.getAll('codeTitle');
  const codeBodies = form.getAll('code');
  // 체크박스는 꺼두면 아예 전송되지 않아 순서가 어긋난다. 그래서 항상 보내지는
  // 숨은 칸(0/1)을 쓰고, 체크박스는 화면에서 그 값을 바꾸는 역할만 한다.
  const codeReleased = form.getAll('codeReleased');
  const codes = codeBodies
    .map((code, index) => ({
      title: String(codeTitles[index] || '').trim(),
      code: String(code || ''),
      released: String(codeReleased[index] ?? '1') === '1',
    }))
    .filter((item) => item.title || item.code.trim());
  return {
    title: (form.get('title') || '').trim(),
    description: (form.get('description') || '').trim(),
    codes,
    materials: (form.get('materials') || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    // 연결 방법은 그림으로만 받는다. 이미 저장된 글은 아래에서 그대로 유지한다.
    wiringDescription: '',
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

  // 사람이 보는 화면 대신, 자동화 도구(scripts/admin-cli.mjs)가 수업과 공개 상태를
  // 읽어갈 때 쓰는 주소. /admin 아래라 로그인 없이는 열리지 않는다.
  if (pathname === '/admin/classes.json' && req.method === 'GET') {
    return send(res, 200, JSON.stringify(await store.listClasses()), { 'Content-Type': 'application/json' });
  }

  if (pathname === '/admin/classes/new' && req.method === 'GET') {
    return html(res, admin.classFormPage({}));
  }

  if (pathname === '/admin/classes' && req.method === 'POST') {
    const data = readClassForm(await readForm(req));
    if (!data.title) return html(res, admin.classFormPage({ cls: data, error: '수업 제목을 입력해 주세요.' }), 400);
    if (data.codes.some((item) => !item.title || !item.code.trim())) {
      return html(res, admin.classFormPage({ cls: data, error: '각 코드의 제목과 내용을 모두 입력해 주세요.' }), 400);
    }
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
    if (data.codes.some((item) => !item.title || !item.code.trim())) {
      return html(res, admin.classFormPage({ cls: { ...cls, ...data }, error: '각 코드의 제목과 내용을 모두 입력해 주세요.' }), 400);
    }
    // 입력칸이 없어진 항목은 저장된 값을 그대로 둔다.
    await store.updateClass(id, { ...data, wiringDescription: cls.wiringDescription });
    return redirect(res, '/admin/classes');
  }

  // 수업 중에 다음 단계 코드를 눌러서 공개하는 곳. 어디서 눌렀든 그 화면으로 돌아간다.
  const backTo = (form) => (form.get('returnTo') === '/admin/classes' ? '/admin/classes' : '/admin');

  const releaseOneMatch = pathname.match(/^\/admin\/classes\/(\d+)\/codes\/(\d+)\/release$/);
  if (releaseOneMatch && req.method === 'POST') {
    const form = await readForm(req);
    await store.setCodeReleased(Number(releaseOneMatch[1]), Number(releaseOneMatch[2]), form.get('released') === '1');
    return redirect(res, backTo(form));
  }

  const releaseNextMatch = pathname.match(/^\/admin\/classes\/(\d+)\/codes\/next$/);
  if (releaseNextMatch && req.method === 'POST') {
    const form = await readForm(req);
    await store.releaseNextCode(Number(releaseNextMatch[1]));
    return redirect(res, backTo(form));
  }

  const releaseAllMatch = pathname.match(/^\/admin\/classes\/(\d+)\/codes\/all$/);
  if (releaseAllMatch && req.method === 'POST') {
    const form = await readForm(req);
    await store.setAllCodesReleased(Number(releaseAllMatch[1]), form.get('released') === '1');
    return redirect(res, backTo(form));
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
    const form = await readForm(req);
    await store.deleteSubmission(Number(deleteSubMatch[1]));
    return redirect(res, form.get('returnTo') === '/admin/submissions' ? '/admin/submissions' : '/admin');
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
