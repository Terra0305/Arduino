import { esc, timeHHMM, dateShort } from '../http.js';
import { layout } from './layout.js';
import { codeBlock } from './student.js';

export function loginPage(error = '') {
  const body = `
<section class="card hero login">
  <h1>관리자</h1>
  ${error ? `<p class="error">${esc(error)}</p>` : ''}
  <form method="post" action="/admin/login">
    <label for="pw">관리자 비밀번호</label>
    <input type="password" id="pw" name="password" autocomplete="current-password" autofocus>
    <button class="big primary" type="submit">들어가기</button>
  </form>
</section>`;
  return layout({ title: '관리자', body, variant: 'admin' });
}

function submissionRow(s, { dim = false, returnTo = '/admin' } = {}) {
  return `<li class="${dim ? 'dimmed' : ''}">
  <a href="/admin/submissions/${s.id}">
    <span class="st">${dim ? '✅' : '🔴'} ${esc(s.studentName)}${s.feedback ? ' 💬' : ''}</span>
    <span class="sc">${esc(s.classTitle || '수업 없음')}</span>
    <span class="stime">${esc(timeHHMM(s.createdAt))}</span>
    <span class="sview">코드 보기</span>
  </a>
  <form class="subdelete" method="post" action="/admin/submissions/${s.id}/delete" data-confirm="${esc(s.studentName)} 학생의 질문과 선생님 답변을 모두 삭제할까요?">
    <input type="hidden" name="returnTo" value="${esc(returnTo)}">
    <button class="btn danger" type="submit" aria-label="${esc(s.studentName)} 학생 질문과 답변 삭제">삭제</button>
  </form>
</li>`;
}

export function adminHome({ current, waiting, recentDone }) {
  const body = `
<section class="card">
  <h2>현재 수업</h2>
  ${
    current
      ? `<div class="currentrow">
      <div>
        <p class="bigtitle">${esc(current.title)}</p>
        ${current.description ? `<p class="dim">${esc(current.description)}</p>` : ''}
        ${current.notice ? `<p class="noticemini">${esc(current.notice)}</p>` : ''}
      </div>
      <a class="btn" href="/admin/classes/${current.id}/edit">수정</a>
    </div>`
      : `<p class="empty">현재 수업이 지정되지 않았어요. 수업 목록에서 하나를 <b>현재 수업</b>으로 지정하세요.</p>`
  }
</section>

<section class="card">
  <h2>학생 질문 <span class="count">${waiting.length}</span></h2>
  ${
    waiting.length
      ? `<ul class="sublist">${waiting.map((s) => submissionRow(s)).join('\n')}</ul>`
      : `<p class="empty">아직 들어온 질문이 없어요.</p>`
  }
  ${
    recentDone.length
      ? `<h3 class="donehead">확인 완료</h3>
         <ul class="sublist">${recentDone.map((s) => submissionRow(s, { dim: true })).join('\n')}</ul>`
      : ''
  }
  <p class="foot"><a href="/admin/submissions">전체 제출 목록 보기</a></p>
</section>

<section class="card actions">
  <a class="big primary" href="/admin/classes/new">새 수업 만들기</a>
  <a class="big ghost" href="/admin/classes">수업 목록</a>
</section>
<p class="dim center">이 화면은 20초마다 자동으로 새로고침됩니다.</p>
`;
  return layout({
    title: '관리자 · 아두이노 수업',
    body,
    variant: 'admin',
    scripts: `<script>setTimeout(function(){location.reload()},20000)</script>`,
  });
}

export function classesPage(classes) {
  const body = `
<h1 class="pagetitle">수업 목록</h1>
<p><a class="btn primary" href="/admin/classes/new">+ 새 수업 만들기</a></p>
${
  classes.length
    ? `<ul class="adminclasslist">
${classes
  .map(
    (c) => `<li class="${c.isCurrent ? 'is-current' : ''}">
  <div class="cinfo">
    <p class="bigtitle">${esc(c.title)}${c.isCurrent ? '<em class="badge">현재 수업</em>' : ''}</p>
    <p class="dim">${esc(dateShort(c.createdAt))}${c.description ? ` · ${esc(c.description)}` : ''}</p>
  </div>
  <div class="cbtns">
    <a class="btn" href="/admin/classes/${c.id}/edit">수정</a>
    ${
      c.isCurrent
        ? ''
        : `<form method="post" action="/admin/classes/${c.id}/current"><button class="btn primary" type="submit">현재 수업으로</button></form>`
    }
    <form method="post" action="/admin/classes/${c.id}/delete" data-confirm="이 수업을 삭제할까요?"><button class="btn danger" type="submit">삭제</button></form>
  </div>
</li>`,
  )
  .join('\n')}
</ul>`
    : `<p class="empty">수업이 없어요. 새 수업을 만들어 주세요.</p>`
}
`;
  return layout({ title: '수업 목록 · 관리자', body, variant: 'admin' });
}

export function classFormPage({ cls = null, error = '' }) {
  const isNew = !cls;
  const v = {
    title: cls?.title ?? '',
    description: cls?.description ?? '',
    code: cls?.code ?? '',
    materials: (cls?.materials ?? []).join('\n'),
    wiringImage: cls?.wiringImage ?? '',
    notice: cls?.notice ?? '',
    isCurrent: cls?.isCurrent ?? isNew,
  };
  const body = `
<h1 class="pagetitle">${isNew ? '새 수업 만들기' : '수업 수정'}</h1>
${error ? `<p class="error">${esc(error)}</p>` : ''}
<form class="card form" method="post" action="${isNew ? '/admin/classes' : `/admin/classes/${cls.id}`}" id="classform">
  <label for="title">수업 제목</label>
  <input type="text" id="title" name="title" value="${esc(v.title)}" placeholder="LCD에 글자 띄우기" required>

  <label for="description">짧은 설명</label>
  <input type="text" id="description" name="description" value="${esc(v.description)}" placeholder="LCD 화면에 Hello를 출력해 봅니다.">

  <label for="code">Arduino 코드</label>
  <textarea id="code" name="code" rows="18" spellcheck="false" class="mono">${esc(v.code)}</textarea>

  <label for="materials">준비물 <span class="dim">(한 줄에 하나씩)</span></label>
  <textarea id="materials" name="materials" rows="5" placeholder="Arduino UNO&#10;LCD 화면&#10;점퍼선 4개">${esc(v.materials)}</textarea>

  <label for="wiringFile">연결 방법 (그림)</label>
  <input type="file" id="wiringFile" accept="image/*">
  <input type="hidden" name="wiringImage" id="wiringImage" value="${esc(v.wiringImage)}">
  <div id="wiringPreview" class="${v.wiringImage ? '' : 'hidden'}">
    <img id="wiringPreviewImg" class="wiringimg" src="${esc(v.wiringImage)}" alt="연결 방법 미리보기">
    <button type="button" class="btn danger" id="wiringRemove">그림 지우기</button>
  </div>

  <label for="notice">한 줄 공지 <span class="dim">(학생 화면 맨 위에 크게 표시)</span></label>
  <input type="text" id="notice" name="notice" value="${esc(v.notice)}" placeholder="⚠️ 오늘은 Arduino UNO만 사용합니다.">

  <label class="check"><input type="checkbox" name="isCurrent" value="1" ${v.isCurrent ? 'checked' : ''}> 이 수업을 <b>현재 수업</b>으로 지정</label>

  <div class="formbtns">
    <button class="big primary" type="submit">저장</button>
    <a class="big ghost" href="/admin/classes">취소</a>
  </div>
</form>
`;
  return layout({ title: `${isNew ? '새 수업' : '수업 수정'} · 관리자`, body, variant: 'admin' });
}

export function submissionsPage(all) {
  const waiting = all.filter((s) => s.status === 'WAITING');
  const done = all.filter((s) => s.status !== 'WAITING');
  const body = `
<h1 class="pagetitle">학생 코드 제출</h1>
<section class="card">
  <h2>확인 필요 <span class="count">${waiting.length}</span></h2>
  ${waiting.length ? `<ul class="sublist">${waiting.map((s) => submissionRow(s, { returnTo: '/admin/submissions' })).join('\n')}</ul>` : `<p class="empty">없어요.</p>`}
</section>
<section class="card">
  <h2>확인 완료</h2>
  ${done.length ? `<ul class="sublist">${done.map((s) => submissionRow(s, { dim: true, returnTo: '/admin/submissions' })).join('\n')}</ul>` : `<p class="empty">없어요.</p>`}
</section>
`;
  return layout({ title: '학생 코드 제출 · 관리자', body, variant: 'admin' });
}

export function submissionPage(s, error = '') {
  const body = `
<section class="card hero">
  <h1>${esc(s.studentName)}</h1>
  <p class="lead"><b>수업:</b> ${esc(s.classTitle || '수업 없음')}<br><b>제출 시간:</b> ${esc(dateShort(s.createdAt))} ${esc(timeHHMM(s.createdAt))}</p>
</section>

<h2 class="pagetitle">학생 코드</h2>
${codeBlock(s.code, { copyLabel: '학생 코드 복사', id: 'subcode' })}

<section class="card">
  <h2>학생에게 답변 남기기</h2>
  ${error ? `<p class="error">${esc(error)}</p>` : ''}
  ${
    s.feedback
      ? `<p class="dim">${esc(timeHHMM(s.feedbackAt))} 에 보낸 답변입니다. 고쳐서 다시 보낼 수 있어요.</p>`
      : `<p class="dim">답변을 보내면 학생 화면에 바로 나타나고, 확인 완료로 함께 넘어갑니다.</p>`
  }
  <form method="post" action="/admin/submissions/${s.id}/feedback">
    <textarea name="feedback" rows="6" maxlength="2000" placeholder="14번째 줄 세미콜론이 빠졌어요. 고쳐서 다시 올려보세요.">${esc(s.feedback || '')}</textarea>
    <button class="big primary" type="submit">💬 답변 보내기</button>
  </form>
</section>

<section class="card actions">
  <button type="button" class="big ghost" data-copy-target="#subcode">📋 학생 코드 복사</button>
  ${
    s.status === 'WAITING'
      ? `<form method="post" action="/admin/submissions/${s.id}/done"><button class="big primary" type="submit">✅ 확인 완료</button></form>`
      : `<form method="post" action="/admin/submissions/${s.id}/waiting"><button class="big ghost" type="submit">다시 확인 필요로</button></form>`
  }
  <form method="post" action="/admin/submissions/${s.id}/delete" data-confirm="${esc(s.studentName)} 학생의 질문과 선생님 답변을 모두 삭제할까요?"><button class="big danger" type="submit">질문과 답변 삭제</button></form>
</section>
<p class="foot"><a href="/admin">관리자 메인으로</a></p>
`;
  return layout({ title: `${s.studentName} · 관리자`, body, variant: 'admin' });
}
