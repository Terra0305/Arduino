import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'app.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    code              TEXT NOT NULL DEFAULT '',
    materials         TEXT NOT NULL DEFAULT '[]',
    wiringDescription TEXT NOT NULL DEFAULT '',
    wiringImage       TEXT NOT NULL DEFAULT '',
    notice            TEXT NOT NULL DEFAULT '',
    isCurrent         INTEGER NOT NULL DEFAULT 0,
    createdAt         TEXT NOT NULL,
    updatedAt         TEXT NOT NULL
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    classId    INTEGER,
    seatNumber TEXT NOT NULL,
    code       TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'WAITING',
    createdAt  TEXT NOT NULL
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(createdAt DESC)');

const now = () => new Date().toISOString();

/** 수업 목록에서 materials 를 배열로 되돌린다. */
function hydrate(row) {
  if (!row) return null;
  let materials = [];
  try {
    const parsed = JSON.parse(row.materials);
    if (Array.isArray(parsed)) materials = parsed.filter((m) => typeof m === 'string');
  } catch {
    materials = [];
  }
  return { ...row, materials, isCurrent: row.isCurrent === 1 };
}

export function getCurrentClass() {
  return hydrate(db.prepare('SELECT * FROM classes WHERE isCurrent = 1 LIMIT 1').get());
}

export function getClass(id) {
  return hydrate(db.prepare('SELECT * FROM classes WHERE id = ?').get(id));
}

export function listClasses() {
  return db.prepare('SELECT * FROM classes ORDER BY isCurrent DESC, createdAt DESC').all().map(hydrate);
}

export function createClass(data) {
  const t = now();
  const info = db
    .prepare(
      `INSERT INTO classes (title, description, code, materials, wiringDescription, wiringImage, notice, isCurrent, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .run(
      data.title,
      data.description,
      data.code,
      JSON.stringify(data.materials),
      data.wiringDescription,
      data.wiringImage,
      data.notice,
      t,
      t,
    );
  const id = Number(info.lastInsertRowid);
  if (data.isCurrent) setCurrentClass(id);
  return id;
}

export function updateClass(id, data) {
  db.prepare(
    `UPDATE classes
        SET title = ?, description = ?, code = ?, materials = ?,
            wiringDescription = ?, wiringImage = ?, notice = ?, updatedAt = ?
      WHERE id = ?`,
  ).run(
    data.title,
    data.description,
    data.code,
    JSON.stringify(data.materials),
    data.wiringDescription,
    data.wiringImage,
    data.notice,
    now(),
    id,
  );
  if (data.isCurrent) setCurrentClass(id);
  else db.prepare('UPDATE classes SET isCurrent = 0 WHERE id = ?').run(id);
}

export function setCurrentClass(id) {
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE classes SET isCurrent = 0').run();
    db.prepare('UPDATE classes SET isCurrent = 1 WHERE id = ?').run(id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function deleteClass(id) {
  db.prepare('DELETE FROM classes WHERE id = ?').run(id);
}

export function createSubmission({ classId, seatNumber, code }) {
  const info = db
    .prepare('INSERT INTO submissions (classId, seatNumber, code, status, createdAt) VALUES (?, ?, ?, ?, ?)')
    .run(classId ?? null, seatNumber, code, 'WAITING', now());
  return Number(info.lastInsertRowid);
}

export function listSubmissions(status) {
  const sql = `SELECT s.*, c.title AS classTitle
                 FROM submissions s
            LEFT JOIN classes c ON c.id = s.classId
                ${status ? 'WHERE s.status = ?' : ''}
             ORDER BY s.createdAt DESC`;
  const stmt = db.prepare(sql);
  return status ? stmt.all(status) : stmt.all();
}

export function getSubmission(id) {
  return db
    .prepare(
      `SELECT s.*, c.title AS classTitle
         FROM submissions s
    LEFT JOIN classes c ON c.id = s.classId
        WHERE s.id = ?`,
    )
    .get(id);
}

export function setSubmissionStatus(id, status) {
  db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
}

export function deleteSubmission(id) {
  db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
}

export function countWaiting() {
  return db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE status = 'WAITING'").get().n;
}

/** 처음 실행했을 때 빈 화면 대신 예시 수업 하나를 보여준다. */
export function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM classes').get();
  if (n > 0) return;
  const id = createClass({
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
  return id;
}
