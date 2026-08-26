import { randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

/**
 * Postgres 접속 주소를 찾는다.
 * Vercel 에서 DB 를 연결할 때 붙이는 이름(prefix)이 사람마다 달라지므로,
 * 정해진 이름부터 보고 없으면 postgres 주소처럼 생긴 환경변수를 찾아 쓴다.
 */
function findConnectionString() {
  const named = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL;
  if (named) return named;

  const looksLikePostgres = /^postgres(ql)?:\/\//;
  const candidates = Object.entries(process.env)
    .filter(([, value]) => value && looksLikePostgres.test(value))
    // 서버리스에서는 연결을 모아 쓰는(pooled) 주소가 유리하다.
    .sort(([a], [b]) => Number(/UNPOOLED|NON_POOLING/i.test(a)) - Number(/UNPOOLED|NON_POOLING/i.test(b)));

  return candidates.length ? candidates[0][1] : null;
}

const CONNECTION_STRING = findConnectionString();

// 여기서 예외가 새어나가면 함수가 시작조차 못 해서 원인을 알 수 없는 오류 화면이 나온다.
// 주소가 없거나 형식이 틀렸다는 사실은 ready() 에서 알려준다.
let sql = null;
let badConnectionString = false;

if (CONNECTION_STRING) {
  try {
    sql = neon(CONNECTION_STRING);
  } catch {
    badConnectionString = true;
  }
}

/* 서버가 첫 요청을 받을 때 한 번만 테이블을 만든다. */
let readyPromise = null;

export function ready() {
  if (!readyPromise) {
    // 실패한 결과를 계속 들고 있으면 DB 가 잠깐 끊겼을 때 영영 복구되지 않는다.
    readyPromise = initialize().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

async function initialize() {
  if (!sql) throw new Error(badConnectionString ? 'BAD_DATABASE_URL' : 'NO_DATABASE');
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id                 SERIAL PRIMARY KEY,
      title              TEXT NOT NULL,
      description        TEXT NOT NULL DEFAULT '',
      code               TEXT NOT NULL DEFAULT '',
      codes              JSONB NOT NULL DEFAULT '[]'::jsonb,
      materials          JSONB NOT NULL DEFAULT '[]'::jsonb,
      wiring_description TEXT NOT NULL DEFAULT '',
      wiring_image       TEXT NOT NULL DEFAULT '',
      notice             TEXT NOT NULL DEFAULT '',
      is_current         BOOLEAN NOT NULL DEFAULT false,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id           SERIAL PRIMARY KEY,
      class_id     INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      student_name TEXT NOT NULL,
      question     TEXT NOT NULL DEFAULT '',
      code         TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'WAITING',
      token        TEXT,
      feedback     TEXT NOT NULL DEFAULT '',
      feedback_at  TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  // 자리 번호로 쓰던 칸을 학생 이름으로 바꾼다 (이미 쌓인 제출도 그대로 남는다).
  const columns = (
    await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions'`
  ).map((row) => row.column_name);
  if (columns.includes('seat_number') && !columns.includes('student_name')) {
    await sql`ALTER TABLE submissions RENAME COLUMN seat_number TO student_name`;
  }
  // 선생님 답변 기능을 위해 나중에 추가된 칸들 (이미 있으면 그냥 넘어간다).
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS token TEXT`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS question TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS feedback TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ`;
  await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS codes JSONB NOT NULL DEFAULT '[]'::jsonb`;

  // 한 개짜리 코드 칸을 사용하던 기존 수업은 제목이 붙은 코드 목록으로 자동 변환한다.
  await sql`
    UPDATE classes
       SET codes = jsonb_build_array(jsonb_build_object('title', '기본 코드', 'code', code))
     WHERE jsonb_array_length(codes) = 0 AND btrim(code) <> ''`;

  // 첫 배포용 예시 수업에 넣어두었던 기본 공지는 이제 표시하지 않는다.
  await sql`
    UPDATE classes
       SET notice = '', updated_at = now()
     WHERE notice = '⚠️ 오늘은 Arduino UNO만 사용합니다.'`;

  // 예전에 들어온 제출에도 학생이 답변을 확인할 주소를 만들어 준다.
  const needToken = await sql`SELECT id FROM submissions WHERE token IS NULL`;
  for (const row of needToken) {
    await sql`UPDATE submissions SET token = ${newToken()} WHERE id = ${row.id}`;
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_token ON submissions (token)`;
  await seedIfEmpty();
}

const CLASS_SELECT = `
  SELECT id, title, description, code, codes, materials,
         wiring_description AS "wiringDescription",
         wiring_image AS "wiringImage",
         notice, is_current, created_at, updated_at
    FROM classes`;

function toClass(row) {
  if (!row) return null;
  const savedCodes = Array.isArray(row.codes)
    ? row.codes.filter((item) => item && typeof item.code === 'string')
    : [];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    code: row.code,
    codes: savedCodes.length
      ? savedCodes.map((item, index) => ({
          title: String(item.title || `코드 ${index + 1}`),
          code: item.code,
        }))
      : row.code
        ? [{ title: '기본 코드', code: row.code }]
        : [],
    materials: Array.isArray(row.materials) ? row.materials : [],
    wiringDescription: row.wiringDescription,
    wiringImage: row.wiringImage,
    notice: row.notice,
    isCurrent: row.is_current === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCurrentClass() {
  const rows = await sql.query(`${CLASS_SELECT} WHERE is_current = true LIMIT 1`);
  return toClass(rows[0]);
}

export async function getClass(id) {
  const rows = await sql.query(`${CLASS_SELECT} WHERE id = $1`, [id]);
  return toClass(rows[0]);
}

export async function listClasses() {
  const rows = await sql.query(`${CLASS_SELECT} ORDER BY is_current DESC, created_at DESC`);
  return rows.map(toClass);
}

export async function createClass(data) {
  const codes = data.codes ?? (data.code ? [{ title: '기본 코드', code: data.code }] : []);
  const legacyCode = codes[0]?.code || '';
  const rows = await sql`
    INSERT INTO classes (title, description, code, codes, materials, wiring_description, wiring_image, notice)
    VALUES (${data.title}, ${data.description}, ${legacyCode}, ${JSON.stringify(codes)}, ${JSON.stringify(data.materials)},
            ${data.wiringDescription}, ${data.wiringImage}, ${data.notice})
    RETURNING id`;
  const id = rows[0].id;
  if (data.isCurrent) await setCurrentClass(id);
  return id;
}

export async function updateClass(id, data) {
  const codes = data.codes ?? (data.code ? [{ title: '기본 코드', code: data.code }] : []);
  const legacyCode = codes[0]?.code || '';
  await sql`
    UPDATE classes
       SET title = ${data.title},
           description = ${data.description},
           code = ${legacyCode},
           codes = ${JSON.stringify(codes)},
           materials = ${JSON.stringify(data.materials)},
           wiring_description = ${data.wiringDescription},
           wiring_image = ${data.wiringImage},
           notice = ${data.notice},
           updated_at = now()
     WHERE id = ${id}`;
  if (data.isCurrent) await setCurrentClass(id);
  else await sql`UPDATE classes SET is_current = false WHERE id = ${id}`;
}

export async function setCurrentClass(id) {
  await sql.transaction([
    sql`UPDATE classes SET is_current = false WHERE is_current = true`,
    sql`UPDATE classes SET is_current = true WHERE id = ${id}`,
  ]);
}

export async function deleteClass(id) {
  await sql`DELETE FROM classes WHERE id = ${id}`;
}

/** 학생이 자기 답변만 볼 수 있도록 추측할 수 없는 열쇠를 만든다. */
function newToken() {
  return randomBytes(12).toString('hex');
}

const SUBMISSION_SELECT = `
  SELECT s.id, s.token, s.student_name AS "studentName", s.question, s.code, s.status,
         s.feedback, s.feedback_at AS "feedbackAt",
         s.created_at AS "createdAt", c.title AS "classTitle"
    FROM submissions s
    LEFT JOIN classes c ON c.id = s.class_id`;

export async function createSubmission({ classId, studentName, question, code }) {
  const token = newToken();
  const rows = await sql`
    INSERT INTO submissions (class_id, student_name, question, code, token)
    VALUES (${classId}, ${studentName}, ${question}, ${code}, ${token})
    RETURNING id`;
  return { id: rows[0].id, token };
}

export async function listSubmissions() {
  return await sql.query(`${SUBMISSION_SELECT} ORDER BY s.created_at DESC`);
}

export async function getSubmission(id) {
  const rows = await sql.query(`${SUBMISSION_SELECT} WHERE s.id = $1`, [id]);
  return rows[0] || null;
}

/**
 * 학생들이 함께 보는 답변판 목록.
 * 다른 학생의 열쇠와 코드가 새어나가면 안 되므로 이름과 답변만 가져온다.
 */
export async function listAnswerBoard(limit = 200) {
  return await sql`
    SELECT s.id, s.student_name AS "studentName", s.question, s.status, s.feedback,
           s.feedback_at AS "feedbackAt", s.created_at AS "createdAt",
           c.title AS "classTitle"
      FROM submissions s
      LEFT JOIN classes c ON c.id = s.class_id
     ORDER BY s.created_at DESC
     LIMIT ${limit}`;
}

export async function getSubmissionByToken(token) {
  const rows = await sql.query(`${SUBMISSION_SELECT} WHERE s.token = $1`, [token]);
  return rows[0] || null;
}

/** 선생님이 답변을 남기면 확인 완료로 함께 넘긴다. */
export async function saveFeedback(id, feedback) {
  await sql`
    UPDATE submissions
       SET feedback = ${feedback},
           feedback_at = now(),
           status = 'DONE'
     WHERE id = ${id}`;
}

export async function setSubmissionStatus(id, status) {
  await sql`UPDATE submissions SET status = ${status} WHERE id = ${id}`;
}

export async function deleteSubmission(id) {
  await sql`DELETE FROM submissions WHERE id = ${id}`;
}

/* 처음 배포했을 때 빈 화면 대신 예시 수업 하나를 보여준다. */
async function seedIfEmpty() {
  const rows = await sql`SELECT COUNT(*)::int AS n FROM classes`;
  if (rows[0].n > 0) return;
  await createClass({
    title: 'LCD에 글자 띄우기',
    description: '오늘은 LCD 화면에 원하는 글자를 표시해 봅니다.',
    code: `#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello");
}

void loop() {

}
`,
    materials: ['Arduino UNO', 'LCD 화면 (I2C)', '점퍼선 4개'],
    wiringDescription: 'LCD GND - Arduino GND\nLCD VCC - Arduino 5V\nLCD SDA - Arduino A4\nLCD SCL - Arduino A5',
    wiringImage: '',
    notice: '',
    isCurrent: true,
  });
}
