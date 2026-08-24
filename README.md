# 아두이노 수업 코드 공유

수업 중 학생이 선생님이 준비한 코드를 **버튼 한 번으로 복사**해서 Arduino IDE에 붙여넣고,
막혔을 때는 **자기 코드를 그대로 선생님에게 보내는** 아주 단순한 웹앱입니다.

- 학생은 회원가입도 로그인도 없음 (이름만 브라우저에 저장)
- 학생이 보낸 코드는 **선생님만** 비밀번호로 로그인해서 볼 수 있음
- Vercel 무료 배포 + Postgres 무료 플랜으로 운영

## 배포하기 (처음 한 번만)

### 1. GitHub에 올리기

```bash
git remote add origin https://github.com/<내아이디>/arduino-class.git
git push -u origin main
```

### 2. Vercel에서 가져오기

1. [vercel.com](https://vercel.com) 로그인 → **Add New… → Project**
2. 방금 올린 저장소 선택 → **Deploy**
3. 첫 배포는 실패하거나 오류 화면이 나옵니다. **정상입니다** — 아직 DB를 안 붙였습니다.

### 3. 데이터베이스 붙이기 (제일 중요)

프로젝트 화면에서 **Storage → Create Database → Neon (Postgres)** 선택 →
**Connect**. `DATABASE_URL` 환경변수가 자동으로 들어갑니다.

> Vercel은 서버 파일이 유지되지 않아서 파일에 데이터를 저장할 수 없습니다.
> 이 단계를 건너뛰면 학생 제출과 수업이 저장되지 않습니다.

### 4. 관리자 비밀번호 정하기

**Settings → Environment Variables** 에서 추가:

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | 원하는 비밀번호 (기본값 `arduino` 는 꼭 바꾸세요) |

### 5. 다시 배포

**Deployments → 맨 위 항목 → ⋯ → Redeploy**

끝입니다. `https://내프로젝트.vercel.app` 주소가 나오면 학생들에게 알려주세요.
처음 접속하면 예시 수업 "LCD에 글자 띄우기"가 들어 있습니다.

## 쓰는 법

### 학생

주소만 열면 됩니다. 로그인 화면을 볼 일이 없습니다.

**📋 코드 복사하기** → Arduino IDE에서 `Ctrl + V` → 업로드.

안 되면 **🙋 선생님, 안 돼요** → 이름 + 코드 붙여넣기 → 보내기.
보내면 답변 대기 화면으로 바로 이동하고, 선생님이 답변하면 화면에 자동으로 나타납니다.
다른 노트북이나 며칠 뒤에는 **💬 선생님 답변 보기** 답변판에서 이름과 날짜로 확인할 수 있습니다.
이름은 브라우저가 기억하므로 두 번째부터는 코드만 붙여넣으면 됩니다.

### 선생님

`https://내프로젝트.vercel.app/admin` 에서 비밀번호로 로그인합니다.

1. **새 수업 만들기** — 제목, 설명, Arduino 코드, 준비물(한 줄에 하나), 연결 방법(글/그림), 한 줄 공지
2. **현재 수업으로 지정** — 학생이 새로고침하면 그 수업이 바로 뜹니다
3. 학생이 보낸 코드는 관리자 메인 **학생 질문**에 최신순으로 쌓입니다 (20초마다 자동 새로고침)
4. 확인했으면 **✅ 확인 완료** — 목록에서 흐리게 내려갑니다

## 수업 코드를 고친 뒤 반영하기

코드를 수정했으면 `git push` 만 하면 Vercel이 알아서 다시 배포합니다.
(수업 내용은 코드가 아니라 관리자 화면에서 고치므로 배포가 필요 없습니다.)

## 환경 변수

| 변수 | 필요 | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | 필수 | Storage에서 Postgres를 연결하면 자동으로 들어옵니다 |
| `ADMIN_PASSWORD` | 권장 | 선생님 로그인 비밀번호. 안 정하면 `arduino` |
| `SESSION_SECRET` | 선택 | 로그인 쿠키 서명 키. 안 정하면 비밀번호에서 만들어 씁니다 |

## 내 컴퓨터에서 확인해 보기 (선택)

배포 전에 화면만 보고 싶을 때 씁니다. `DATABASE_URL` 이 있어야 DB 화면이 뜹니다.

```bash
npm install
DATABASE_URL="postgres://..." ADMIN_PASSWORD=test npm start
# http://localhost:3000
```

## 폴더 구조

```
api/index.js         Vercel 진입점
vercel.json          모든 주소를 api/index.js 로 보내는 설정
server.js            내 컴퓨터에서 확인할 때 쓰는 진입점
src/app.js           라우팅 (학생 / 관리자)
src/db.js            Postgres 테이블과 조회/저장 함수
src/http.js          요청·응답 도우미 (HTML 이스케이프, 본문 읽기, 쿠키)
src/auth.js          관리자 비밀번호와 로그인 쿠키
src/highlight.js     Arduino(C++) 문법 강조
src/views/           화면 (layout / student / admin)
public/style.css     스타일 — 큰 글씨, 큰 버튼
public/app.js        코드 복사, 이름 저장, 그림 업로드
```

## 알아두면 좋은 점

- 학생이 보낸 코드를 읽는 주소는 전부 `/admin` 아래에 있고, 로그인 없이는 열리지 않습니다.
- 학생에게 받는 정보는 **이름과 코드뿐**입니다. 이메일이나 연락처는 받지 않습니다.
- 연결 방법 그림은 업로드할 때 브라우저에서 1600px 이하로 줄여 DB에 함께 저장합니다.
- 학생 코드는 한 번에 20만 자까지 받습니다. 그보다 길면 안내 문구가 뜹니다.
