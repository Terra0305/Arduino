# CLAUDE.md

이 저장소에서 작업하는 Claude Code 에이전트를 위한 안내입니다. 사용자 대상 설명은 [README.md](README.md)를 보세요.

## 프로젝트 한 줄 요약

아두이노 수업용 코드 공유 웹앱. 학생은 로그인 없이 선생님이 올린 코드를 복사하고, 막히면 질문을 보낸다.
선생님은 `/admin`에서 비밀번호로 로그인해 수업을 만들고 코드를 단계별로 공개한다.
Vercel(서버리스) + Neon Postgres로 운영되며, 프레임워크 없이 Node.js 내장 `http` 모듈 위에 직접 짠 구조다.
빌드 단계, TypeScript, 번들러, 테스트 스크립트 전부 없음 — 순수 Node ESM (`"type": "module"`, Node ≥20).

## 구조

- `api/index.js` — Vercel 서버리스 진입점. `server.js` — 로컬 실행용 진입점. 둘 다 `src/app.js`의 `handleRequest`만 호출한다.
- `src/app.js` — 라우팅 전부 (학생 / 관리자). 새 주소를 추가할 땐 여기.
- `src/db.js` — Postgres 스키마와 조회/저장 함수. `ready()`가 최초 요청 시 테이블을 만들고 마이그레이션한다.
- `src/http.js` — HTML 이스케이프(`esc`), 폼 파싱, 쿠키. **HTML에 값을 넣을 땐 반드시 `esc()`를 거친다.**
- `src/auth.js` — 관리자 비밀번호 확인, 로그인 쿠키(HMAC 서명, 파일 저장 없이 서버 재시작에도 유지됨).
- `src/views/` — 화면. `layout.js`(공통 뼈대), `student.js`, `admin.js`. 전부 문자열 템플릿으로 HTML을 직접 만든다(React나 템플릿 엔진 없음).
- `public/` — 정적 파일(`style.css`, `app.js`, 로고). `app.js`는 바닐라 JS로 클라이언트 쪽 상호작용(복사, 토글, 폴링)을 담당.
- `scripts/admin-cli.mjs` — 관리자 화면 버튼과 같은 동작을 HTTP 요청으로 실행하는 자동화 CLI. 아래 절 참고.

## 코딩 관례

- 폼은 `application/x-www-form-urlencoded`만 쓴다(이미지도 data URI로 hidden input에 넣는다). `readForm()`은 raw body를 그냥 `URLSearchParams`로 파싱하므로 `Content-Type` 헤더를 검사하지 않는다.
- 주석은 "왜"만 남긴다("무엇을 하는지"는 코드로 드러나야 함) — 기존 파일들의 스타일을 따를 것.
- 사용자 대상 텍스트(에러 메시지, 라벨 등)는 전부 한국어, 존댓말.
- 관리자 화면에 새 동작(버튼/폼)을 추가하면, 자동화로도 쓸 수 있게 `scripts/admin-cli.mjs`에 대응 명령을 같이 추가하는 걸 고려한다.

## 로컬 확인

```bash
npm install
DATABASE_URL="postgres://..." ADMIN_PASSWORD=test npm start
# http://localhost:3000
```

`DATABASE_URL`이 없으면 준비 중 안내 화면만 뜬다.

## 배포

`main`에 push하면 Vercel이 자동으로 재배포한다 (GitHub remote: `origin` → `Terra0305/Arduino`).
**이 저장소는 실제 학생들이 쓰는 사이트에 연결돼 있다** — push는 변경 사항을 확인한 뒤에 한다.

## 관리자 자동화 (scripts/admin-cli.mjs)

관리자 화면을 사람이 클릭하는 대신, 같은 요청을 코드로 보내는 CLI다.
사용자가 수업 내용(제목 / 단계별 코드 / 공개 여부)을 텍스트로 주면 이 도구로 사이트에 반영할 수 있다.
이 CLI로 만들거나 바꾸는 내용은 학생 화면에 바로 반영되는 실제 배포 사이트의 데이터다.

- 프로젝트 루트의 `.env`에 `ADMIN_SITE_URL`과 `ADMIN_PASSWORD`가 들어 있다. (`.env`는 `.gitignore`에 있어 커밋되지 않는다.)
- 사용법: `npm run admin -- <명령>` 또는 `node scripts/admin-cli.mjs <명령>`. 인자 없이 실행하면 전체 명령 목록과 spec JSON 형태가 나온다.
- 주요 명령: `list`(수업 목록 + 공개 상태), `create <spec.json|JSON 문자열>`, `update <classId> <spec>`, `current <classId>`, `release-next <classId>`, `release <classId> <index> <0|1>`, `release-all <classId> <0|1>`.
- `.env`의 `ADMIN_PASSWORD`는 실제 배포된 사이트의 관리자 비밀번호다. 채팅이나 로그에 그대로 출력하지 않는다.
- 로그인이 401로 실패하면 Vercel에서 비밀번호가 바뀐 것이다 — 사용자에게 실제 값을 다시 확인한 뒤 `.env`를 갱신한다.
- 수업 삭제처럼 되돌리기 어려운 동작은 이 CLI에 넣지 않았다 — 필요하면 관리자 화면에서 직접 한다.
