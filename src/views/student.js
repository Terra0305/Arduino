import { esc, dateShort } from '../http.js';
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

export function classPage(cls, { label = '오늘의 수업', showPastLink = true } = {}) {
  const body = `
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
</section>

${showPastLink ? `<p class="foot"><a href="/classes">지난 수업 보기</a></p>` : `<p class="foot"><a href="/">오늘의 수업으로 돌아가기</a></p>`}
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
<p class="foot"><a href="/classes">지난 수업 보기</a></p>
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

export function helpPage({ cls, error = '', code = '' }) {
  const body = `
<section class="card hero">
  <h1>문제가 생겼나요?</h1>
  <p class="lead">지금 Arduino에 있는 코드를 그대로 선생님에게 보내요.${cls ? ` <b>${esc(cls.title)}</b>` : ''}</p>
</section>

${error ? `<p class="error">${esc(error)}</p>` : ''}

<form class="card" method="post" action="/help" id="helpform">
  <input type="hidden" name="classId" value="${cls ? cls.id : ''}">

  <h2>1. 자리 번호</h2>
  <div class="seatrow">
    <input class="seat" type="number" inputmode="numeric" min="1" max="999" name="seatNumber" id="seat" placeholder="7" autocomplete="off">
    <span class="seatunit">번</span>
  </div>
  <p class="dim seatsaved hidden" id="seatsaved"></p>

  <h2>2. Arduino에 있는 코드를 붙여넣으세요</h2>
  <textarea name="code" id="helpcode" rows="14" spellcheck="false" placeholder="여기를 누르고 Ctrl + V">${esc(code)}</textarea>

  <h2>3. 보내기</h2>
  <button class="big primary" type="submit">선생님에게 보내기</button>
</form>

<p class="foot"><a href="/">돌아가기</a></p>
`;
  return layout({ title: '선생님, 안 돼요', body });
}

export function helpDonePage(seatNumber) {
  const body = `
<section class="card hero done">
  <h1>✅ 선생님에게 보냈어요!</h1>
  <p class="lead">${esc(seatNumber)}번 자리에서 기다려주세요.</p>
  <a class="big ghost" href="/">돌아가기</a>
</section>
`;
  return layout({ title: '보냈어요', body });
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
