import { esc } from '../http.js';

export function layout({ title, body, variant = 'student', head = '', scripts = '' }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
<link rel="icon" href="/arduino-logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
${head}
</head>
<body class="${variant}">
<header class="top">
  <div class="wrap">
    ${
      variant === 'admin'
        ? `<a class="brand" href="/admin"><img class="brandlogo" src="/arduino-logo.svg" alt=""> <span class="brandname">아두이노 수업</span> <span>관리자</span></a>
           <nav class="topnav">
             <a href="/admin/classes">수업 목록</a>
             <a href="/admin/submissions">학생 질문</a>
             <a href="/" target="_blank" rel="noopener">학생 화면</a>
             <form method="post" action="/admin/logout"><button class="linklike" type="submit">로그아웃</button></form>
           </nav>`
        : `<a class="brand" href="/"><img class="brandlogo" src="/arduino-logo.svg" alt=""> <span class="brandname">아두이노 수업</span></a>
           <nav class="topnav studentnav">
             <a href="/classes">수업 목록</a>
           </nav>`
    }
  </div>
</header>
<main class="wrap">
${body}
</main>
<script src="/app.js"></script>
${scripts}
</body>
</html>`;
}
