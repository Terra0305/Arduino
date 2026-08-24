import { neon } from '@neondatabase/serverless';

const CONNECTION_STRING =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

// 여기서 예외를 던지면 함수가 시작조차 못 해서 원인을 알 수 없는 오류 화면이 나온다.
// 접속문자열이 없다는 사실은 ready() 에서 알려준다.
const sql = CONNECTION_STRING ? neon(CONNECTION_STRING) : null;

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
  if (!sql) throw new Error('NO_DATABASE');
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id                 SERIAL PRIMARY KEY,
      title              TEXT NOT NULL,
      description        TEXT NOT NULL DEFAULT '',
      code               TEXT NOT NULL DEFAULT '',
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
      id          SERIAL PRIMARY KEY,
      class_id    INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      seat_number TEXT NOT NULL,
      code        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'WAITING',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at DESC)`;
  await seedIfEmpty();
}

const CLASS_SELECT = `
  SELECT id, title, description, code, materials,
         wiring_description AS "wiringDescription",
         wiring_image AS "wiringImage",
         notice, is_current, created_at, updated_at
    FROM classes`;

function toClass(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    code: row.code,
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
  const rows = await sql`
    INSERT INTO classes (title, description, code, materials, wiring_description, wiring_image, notice)
    VALUES (${data.title}, ${data.description}, ${data.code}, ${JSON.stringify(data.materials)},
            ${data.wiringDescription}, ${data.wiringImage}, ${data.notice})
    RETURNING id`;
  const id = rows[0].id;
  if (data.isCurrent) await setCurrentClass(id);
  return id;
}

export async function updateClass(id, data) {
  await sql`
    UPDATE classes
       SET title = ${data.title},
           description = ${data.description},
           code = ${data.code},
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

export async function createSubmission({ classId, seatNumber, code }) {
  const rows = await sql`
    INSERT INTO submissions (class_id, seat_number, code)
    VALUES (${classId}, ${seatNumber}, ${code})
    RETURNING id`;
  return rows[0].id;
}

export async function listSubmissions() {
  return await sql`
    SELECT s.id, s.seat_number AS "seatNumber", s.code, s.status,
           s.created_at AS "createdAt", c.title AS "classTitle"
      FROM submissions s
      LEFT JOIN classes c ON c.id = s.class_id
     ORDER BY s.created_at DESC`;
}

export async function getSubmission(id) {
  const rows = await sql`
    SELECT s.id, s.seat_number AS "seatNumber", s.code, s.status,
           s.created_at AS "createdAt", c.title AS "classTitle"
      FROM submissions s
      LEFT JOIN classes c ON c.id = s.class_id
     WHERE s.id = ${id}`;
  return rows[0] || null;
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
    notice: '⚠️ 오늘은 Arduino UNO만 사용합니다.',
    isCurrent: true,
  });
}
