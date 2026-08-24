import { esc, dateShort, timeHHMM } from '../http.js';
import { highlight } from '../highlight.js';
import { layout } from './layout.js';

function notice(cls) {
  if (!cls?.notice) return '';
  return `<div class="notice">${esc(cls.notice)}</div>`;
}

export function codeBlock(code, { copyLabel = '코드 복사', id = 'code' } = {}) {
  if (!code.trim()) return `<p class="empty">아직 코드가 없어요.</p>`;
  return `<div class="codebox">
  <div class="codebar">
    <span>Arduino 코드</span>
    <button type="button" class="copy small" data-copy-target="#${esc(id)}">📋 ${esc(copyLabel)}</button>
  </div>
  <pre id="${esc(id)}"><code>${highlight(code)}</code></pre>
</div>`;
}

const STEPS = [
  ['1️⃣', '<b>코드 복사하기</b>를 눌러요.'],
  ['2️⃣', 'Arduino 프로그램을 열어요.'],
  ['3️⃣', '기존 코드를 모두 지워요. <span class="dim">(Ctrl + A → Delete)</span>'],
  ['4️⃣', '<b>Ctrl + V</b>를 눌러요.'],
  ['5️⃣', '화살표 모양 <b>업로드</b> 버튼(→)을 눌러요.'],
];

function steps() {
  return `<section class="card">
  <h2>이렇게 하세요</h2>
  <ol class="steps">
    ${STEPS.map(([icon, text]) => `<li><span class="stepicon">${icon}</span><span>${text}</span></li>`).join('\n    ')}
  </ol>
</section>`;
}

function materials(cls) {
  if (!cls.materials.length) return '';
  return `<section class="card">
  <h2>오늘 필요한 것</h2>
  <ul class="materials">
    ${cls.materials.map((m) => `<li>${esc(m)}</li>`).join('\n    ')}
  </ul>
</section>`;
}

function wiring(cls) {
  const hasImage = Boolean(cls.wiringImage);
  const hasText = Boolean(cls.wiringDescription.trim());
  if (!hasImage && !hasText) return '';
  return `<section class="card">
  <button type="button" class="big ghost" data-toggle="#wiring" data-toggle-label="🔌 연결 방법 닫기">🔌 연결 방법 보기</button>
  <div id="wiring" class="hidden wiring">
    ${hasImage ? `<img class="wiringimg" src="${esc(cls.wiringImage)}" alt="연결 방법 그림">` : ''}
    ${hasText ? `<pre class="wiringtext">${esc(cls.wiringDescription)}</pre>` : ''}
  </div>
</section>`;
}

export function classPage(cls, { label = '오늘의 수업' } = {}) {
  const body = `
<div id="answerbanner"></div>
${notice(cls)}
<section class="card hero">
  <p class="eyebrow">${esc(label)}</p>
  <h1>${esc(cls.title)}</h1>
  ${cls.description ? `<p class="lead">${esc(cls.description)}</p>` : ''}
  ${
    cls.code.trim()
      ? `<button type="button" class="big primary" data-copy-target="#code" data-copy-again="📋 다시 복사하기">📋 코드 복사하기</button>
         <p class="copyhint" data-copy-hint>버튼을 누르면 코드 전체가 복사돼요.</p>`
      : ''
  }
</section>

${codeBlock(cls.code)}

${steps()}

${materials(cls)}

${wiring(cls)}

<section class="card">
  <a class="big warn" href="/help?classId=${cls.id}">🙋 선생님, 안 돼요</a>
  <a class="big ghost" href="/answers">💬 선생님 답변 보기</a>
  <div id="myanswer"></div>
</section>

`;
  return layout({ title: `${cls.title} · 아두이노 수업`, body });
}

export function noClassPage() {
  const body = `
<section class="card hero">
  <p class="eyebrow">오늘의 수업</p>
  <h1>아직 수업이 준비되지 않았어요.</h1>
  <p class="lead">선생님이 수업을 올리면 이 화면에 바로 나와요. 잠시 기다렸다가 새로고침(F5) 해 주세요.</p>
</section>
`;
  return layout({ title: '아두이노 수업', body });
}

export function classListPage(classes) {
  const body = `
<h1 class="pagetitle">지난 수업</h1>
${
  classes.length
    ? `<ul class="classlist">
  ${classes
    .map(
      (c) => `<li><a href="/classes/${c.id}">
      <span class="ct">${esc(c.title)}${c.isCurrent ? '<em class="badge">오늘 수업</em>' : ''}</span>
      <span class="cd">${esc(dateShort(c.createdAt))}</span>
    </a></li>`,
    )
    .join('\n  ')}
</ul>`
    : `<p class="empty">아직 수업이 없어요.</p>`
}
<p class="foot"><a href="/">오늘의 수업으로 돌아가기</a></p>
`;
  return layout({ title: '지난 수업 · 아두이노 수업', body });
}

export function helpPage({ cls, error = '', code = '', name = '' }) {
  const body = `
<section class="card hero">
  <h1>문제가 생겼나요?</h1>
  <p class="lead">지금 Arduino에 있는 코드를 그대로 선생님에게 보내요.${cls ? ` <b>${esc(cls.title)}</b>` : ''}</p>
</section>

${error ? `<p class="error">${esc(error)}</p>` : ''}

<form class="card" method="post" action="/help" id="helpform">
  <input type="hidden" name="classId" value="${cls ? cls.id : ''}">

  <h2>1. 이름</h2>
  <input class="namebox" type="text" name="studentName" id="studentName" value="${esc(name)}" placeholder="홍길동" maxlength="20" autocomplete="off">
  <p class="dim seatsaved hidden" id="namesaved"></p>

  <h2>2. Arduino에 있는 코드를 붙여넣으세요</h2>
  <textarea name="code" id="helpcode" rows="14" spellcheck="false" placeholder="여기를 누르고 Ctrl + V">${esc(code)}</textarea>

  <h2>3. 보내기</h2>
  <button class="big primary" type="submit">선생님에게 보내기</button>
</form>

<p class="foot"><a href="/">돌아가기</a></p>
`;
  return layout({ title: '선생님, 안 돼요', body });
}

export function helpDonePage(studentName, token) {
  const body = `
<section class="card hero done" data-my-token="${esc(token)}">
  <h1>✅ 선생님에게 보냈어요!</h1>
  <p class="lead">${esc(studentName)} 학생, 선생님이 확인할 거예요. 잠깐 기다려주세요.</p>
  <a class="big primary" href="/my/${esc(token)}">💬 선생님 답변 확인하기</a>
  <a class="big ghost" href="/">수업으로 돌아가기</a>
</section>
`;
  return layout({ title: '보냈어요', body });
}

/** 누구나 볼 수 있는 답변판. 로그인도, 브라우저 기억도 필요하지 않다. */
export function answersPage(list) {
  const rows = list
    .map((s) => {
      const answered = Boolean(s.feedback);
      return `<li class="${answered ? 'answered' : 'waiting'}">
  <div class="ahead">
    <span class="aname">${answered ? '💬' : '🙋'} ${esc(s.studentName)}</span>
    <span class="atime">${esc(dateShort(s.createdAt))} ${esc(timeHHMM(s.createdAt))}</span>
  </div>
  ${
    answered
      ? `<div class="feedback">${esc(s.feedback)}</div>`
      : `<p class="dim">선생님이 확인하고 있어요.</p>`
  }
</li>`;
    })
    .join('\n');

  const body = `
<section class="card hero">
  <p class="eyebrow">선생님 답변</p>
  <h1>선생님이 뭐라고 했나요?</h1>
  <p class="lead">보낸 질문과 선생님 답변이 여기에 모여요. 답변이 오면 저절로 나타나요.</p>
</section>

${
  list.length
    ? `<ul class="answerlist">\n${rows}\n</ul>`
    : `<p class="empty">아직 보낸 질문이 없어요.</p>`
}

<p class="foot"><a href="/">수업으로 돌아가기</a></p>
`;
  return layout({
    title: '선생님 답변 · 아두이노 수업',
    body,
    scripts: `<script>setTimeout(function(){location.reload()},15000)</script>`,
  });
}

/** 학생이 보낸 질문 한 건. 브라우저에서 여러 건을 모아 목록으로 보여준다. */
export function myQuestionCard(sub) {
  const answered = Boolean(sub.feedback);
  return `<article class="card questioncard ${answered ? 'answered' : 'waiting'}" data-question-token="${esc(sub.token)}" data-question-state="${answered ? 'answered' : 'waiting'}">
  <div class="questionhead">
    <div>
      <p class="eyebrow qsequence">질문</p>
      <h2>${esc(sub.classTitle || '수업')}</h2>
    </div>
    <span class="questionstatus">${answered ? '💬 답변 완료' : '⏳ 답변 대기'}</span>
  </div>
  <p class="questiontime">${esc(dateShort(sub.createdAt))} ${esc(timeHHMM(sub.createdAt))} 에 보냈어요.</p>

  <section class="questionanswer">
    <h3>선생님 답변</h3>
  ${
    answered
      ? `<div class="feedback">${esc(sub.feedback)}</div>
         <p class="dim">${esc(timeHHMM(sub.feedbackAt))} 에 도착했어요.</p>`
      : `<p class="empty">아직 답변이 없어요. 이 화면을 열어두면 답변이 오는 대로 나와요.</p>`
  }
  </section>

  <details class="questioncode">
    <summary>📎 내가 보낸 코드 보기</summary>
    ${codeBlock(sub.code, { copyLabel: '내 코드 복사', id: `mycode-${sub.token}` })}
  </details>
</article>`;
}

/** 현재 주소의 질문을 먼저 보여주고, 기억된 다른 질문은 JS가 이 목록에 합쳐 넣는다. */
export function mySubmissionPage(sub) {
  const body = `
<section class="card hero" data-my-token="${esc(sub.token)}">
  <p class="eyebrow">${esc(sub.studentName)} 학생</p>
  <h1>내 질문 목록</h1>
  <p class="lead">질문한 코드와 선생님 답변을 한꺼번에 볼 수 있어요.</p>
  ${sub.feedback ? '' : '<p class="waitinglive">⏳ 이 화면에서 기다리면 선생님 답변이 자동으로 나타나요.</p>'}
</section>

<div id="myquestions" data-my-history data-current-token="${esc(sub.token)}">
  ${myQuestionCard(sub)}
</div>

<p class="foot"><a href="/">수업으로 돌아가기</a></p>
`;
  return layout({
    title: '내 질문 목록',
    body,
  });
}

export function errorPage(message) {
  const body = `
<section class="card hero">
  <h1>${esc(message)}</h1>
  <a class="big ghost" href="/">오늘의 수업으로 가기</a>
</section>`;
  return layout({ title: '아두이노 수업', body });
}

/** 아직 데이터베이스를 연결하지 않았을 때 (배포 직후 한 번만 보게 된다). */
export function setupPage(badUrl = false) {
  const body = `
<section class="card hero">
  <p class="eyebrow">준비 중</p>
  <h1>아직 준비가 끝나지 않았어요.</h1>
  <p class="lead">학생들은 잠시 기다렸다가 새로고침(F5) 해 주세요.</p>
</section>
<section class="card">
  <h2>선생님께</h2>
  ${
    badUrl
      ? `<p>DB 주소를 찾았지만 형식이 올바르지 않습니다. <code>postgresql://사용자:비밀번호@호스트/DB</code> 형태여야 합니다.
           Vercel의 <b>Settings → Environment Variables</b> 에서 값을 확인해 주세요.</p>`
      : `<p>데이터베이스가 아직 연결되지 않았습니다. Vercel에서 두 가지만 하면 됩니다.</p>
         <ol class="steps">
           <li><span class="stepicon">1️⃣</span><span><b>Storage → Create Database → Neon (Postgres) → Connect</b></span></li>
           <li><span class="stepicon">2️⃣</span><span><b>Deployments → 맨 위 항목 → ⋯ → Redeploy</b> <span class="dim">(환경변수는 다시 배포해야 반영됩니다)</span></span></li>
         </ol>`
  }
</section>`;
  return layout({ title: '준비 중 · 아두이노 수업', body });
}
