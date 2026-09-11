#!/usr/bin/env node
/**
 * 완성된 Arduino 코드에서 학습 포인트가 되는 값(핀 번호, HIGH/LOW, delay 값,
 * INPUT/OUTPUT 등)을 찾아 자동으로 빈칸(____)으로 바꾼다.
 * 수업 단계별 빈칸 문제를 매번 손으로 만드는 수고를 줄이기 위한 도구.
 *
 * 완벽하게 사람처럼 골라내진 못한다 — 초안을 빠르게 만들어주는 용도이고,
 * 필요하면 만들어진 결과를 손으로 조정해서 쓴다.
 *
 * 사용법:
 *   node scripts/make-blanks.mjs <코드 파일 경로 또는 '-' (표준입력)>
 *   node scripts/make-blanks.mjs <코드 파일> --level=pin
 *
 * level (기본은 인자 없이 실행하면 3단계를 한 번에 다 보여준다):
 *   value  HIGH/LOW, delay() 숫자, == 비교값만 뚫는다 (가장 쉬움)
 *   pin    value + pinMode/digitalWrite/digitalRead 안의 핀 변수도 뚫는다
 *   mode   pin + pinMode 두 번째 인자(INPUT/OUTPUT/INPUT_PULLUP)도 뚫는다 (가장 어려움)
 *
 * 정답 배열은 항상 코드에 실제로 나타나는 빈칸 순서(왼쪽→오른쪽, 위→아래)를 따른다 —
 * 카테고리별로 모아서 반환하지 않는다. 그래야 정답지를 그대로 순서대로 읽을 수 있다.
 */
import { readFile } from 'node:fs/promises';

const BLANK = '____';

function isAlreadyBlank(token) {
  return /^_+$/.test(token.trim());
}

const VALUE_PATTERN =
  /\bdelay\(\s*(\d+)\s*\)|\bdigitalWrite\(\s*([^,()]+?)\s*,\s*(HIGH|LOW)\s*\)|==\s*(HIGH|LOW)\b/g;

const PIN_PATTERN =
  /\bdelay\(\s*(\d+)\s*\)|\bdigitalWrite\(\s*([^,()]+?)\s*,\s*(HIGH|LOW)\s*\)|\bpinMode\(\s*([^,()]+?)\s*,\s*(INPUT_PULLUP|INPUT|OUTPUT)\s*\)|\bdigitalRead\(\s*([^()]+?)\s*\)|==\s*(HIGH|LOW)\b/g;

/** value: delay 숫자 / digitalWrite 값 / 비교값만 뚫는다. 핀 변수는 그대로 둔다. */
function blankValueLevel(code) {
  const answers = [];
  code = code.replace(VALUE_PATTERN, (whole, delayNum, writePin, writeVal, cmpVal) => {
    if (delayNum !== undefined) {
      answers.push(delayNum);
      return `delay(${BLANK})`;
    }
    if (writeVal !== undefined) {
      answers.push(writeVal);
      return `digitalWrite(${writePin}, ${BLANK})`;
    }
    if (cmpVal !== undefined) {
      answers.push(cmpVal);
      return `== ${BLANK}`;
    }
    return whole;
  });
  return { code, answers };
}

/** pin: value 항목 + pinMode/digitalWrite/digitalRead 의 핀 변수도 뚫는다. pinMode 의 모드 키워드는 남긴다. */
function blankPinLevel(code) {
  const answers = [];
  code = code.replace(
    PIN_PATTERN,
    (whole, delayNum, writePin, writeVal, modePin, modeKind, readPin, cmpVal) => {
      if (delayNum !== undefined) {
        answers.push(delayNum);
        return `delay(${BLANK})`;
      }
      if (writeVal !== undefined) {
        if (isAlreadyBlank(writePin)) {
          answers.push(writeVal);
          return `digitalWrite(${writePin}, ${BLANK})`;
        }
        answers.push(writePin.trim(), writeVal);
        return `digitalWrite(${BLANK}, ${BLANK})`;
      }
      if (modeKind !== undefined) {
        if (isAlreadyBlank(modePin)) return whole;
        answers.push(modePin.trim());
        return `pinMode(${BLANK}, ${modeKind})`;
      }
      if (readPin !== undefined) {
        if (isAlreadyBlank(readPin)) return whole;
        answers.push(readPin.trim());
        return `digitalRead(${BLANK})`;
      }
      if (cmpVal !== undefined) {
        answers.push(cmpVal);
        return `== ${BLANK}`;
      }
      return whole;
    },
  );
  return { code, answers };
}

/** mode: pin 항목 + pinMode 의 모드 키워드(INPUT/OUTPUT/INPUT_PULLUP)도 뚫는다. */
function blankModeLevel(code) {
  const answers = [];
  code = code.replace(
    PIN_PATTERN,
    (whole, delayNum, writePin, writeVal, modePin, modeKind, readPin, cmpVal) => {
      if (delayNum !== undefined) {
        answers.push(delayNum);
        return `delay(${BLANK})`;
      }
      if (writeVal !== undefined) {
        if (isAlreadyBlank(writePin)) {
          answers.push(writeVal);
          return `digitalWrite(${writePin}, ${BLANK})`;
        }
        answers.push(writePin.trim(), writeVal);
        return `digitalWrite(${BLANK}, ${BLANK})`;
      }
      if (modeKind !== undefined) {
        if (isAlreadyBlank(modePin)) {
          answers.push(modeKind);
          return `pinMode(${modePin}, ${BLANK})`;
        }
        answers.push(modePin.trim(), modeKind);
        return `pinMode(${BLANK}, ${BLANK})`;
      }
      if (readPin !== undefined) {
        if (isAlreadyBlank(readPin)) return whole;
        answers.push(readPin.trim());
        return `digitalRead(${BLANK})`;
      }
      if (cmpVal !== undefined) {
        answers.push(cmpVal);
        return `== ${BLANK}`;
      }
      return whole;
    },
  );
  return { code, answers };
}

const LEVEL_FN = { value: blankValueLevel, pin: blankPinLevel, mode: blankModeLevel };
export const LEVEL_ORDER = ['value', 'pin', 'mode'];

/** 관리자 화면/스펙에 넣을 코드 제목을 만들 때 쓰는 기본 라벨. */
export const LEVEL_LABEL = {
  value: '값만 채우기',
  pin: '핀 변수까지 채우기',
  mode: '전체 채우기',
};

/** 완성 코드를 한 난이도로 빈칸 처리한다. */
export function makeBlanks(code, level = 'value') {
  const fn = LEVEL_FN[level];
  if (!fn) throw new Error(`알 수 없는 level: ${level} (value | pin | mode 중 하나)`);
  const { code: blanked, answers } = fn(code);
  return { level, label: LEVEL_LABEL[level], code: blanked, answers, blankCount: answers.length };
}

/** 완성 코드를 난이도별로 한 번에 만든다 (기본: value → pin → mode). */
export function makeStages(code, levels = LEVEL_ORDER) {
  return levels.map((level) => makeBlanks(code, level));
}

const USAGE = `사용법:
  node scripts/make-blanks.mjs <코드 파일 경로 또는 '-' (표준입력)>          → value/pin/mode 3단계를 한 번에 보여준다
  node scripts/make-blanks.mjs <코드 파일> --level=value|pin|mode            → 그 난이도 하나만 보여준다

level (뚫는 정도, 점점 더 많이 뚫림):
  value  HIGH/LOW, delay() 숫자, == 비교값만 뚫는다 (가장 쉬움)
  pin    value + pinMode/digitalWrite/digitalRead 안의 핀 변수도 뚫는다
  mode   pin + pinMode 두 번째 인자(INPUT/OUTPUT/INPUT_PULLUP)도 뚫는다 (가장 어려움)
`;

async function readInput(arg) {
  if (!arg || arg === '-') {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  }
  return readFile(arg, 'utf8');
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const rawArgs = process.argv.slice(2);
  const levelArg = rawArgs.find((a) => a.startsWith('--level='));
  const fileArg = rawArgs.find((a) => !a.startsWith('--'));

  if (!fileArg) {
    console.log(USAGE);
    process.exit(0);
  }

  readInput(fileArg)
    .then((code) => {
      const level = levelArg ? levelArg.split('=')[1] : null;
      const stages = level ? [makeBlanks(code, level)] : makeStages(code);
      for (const stage of stages) {
        console.log(`\n===== ${stage.level} · ${stage.label} (빈칸 ${stage.blankCount}개) =====`);
        console.log(stage.code);
        console.error(`(${stage.level} 정답 순서: ${stage.answers.join(', ')})`);
      }
    })
    .catch((err) => {
      console.error('오류:', err.message);
      process.exit(1);
    });
}
