import { esc } from './http.js';

const KEYWORDS = new Set([
  'auto', 'bool', 'break', 'byte', 'case', 'char', 'class', 'const', 'continue', 'default', 'delete', 'do',
  'double', 'else', 'enum', 'extern', 'false', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'new',
  'nullptr', 'private', 'protected', 'public', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
  'switch', 'template', 'this', 'true', 'typedef', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile',
  'while', 'String', 'boolean', 'word', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN',
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
]);

const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#[A-Za-z_]+[^\n]*)|(\b\d[\w.]*)|([A-Za-z_]\w*)/g;

/** Arduino(C++) 코드를 span 으로 감싼 안전한 HTML 로 바꾼다. */
export function highlight(code) {
  const src = String(code ?? '');
  let out = '';
  let last = 0;
  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(src)) !== null) {
    out += esc(src.slice(last, m.index));
    const [text, comment, string, preproc, number, word] = m;
    if (comment) out += `<span class="t-comment">${esc(text)}</span>`;
    else if (string) out += `<span class="t-string">${esc(text)}</span>`;
    else if (preproc) out += `<span class="t-pre">${esc(text)}</span>`;
    else if (number) out += `<span class="t-num">${esc(text)}</span>`;
    else if (word) {
      if (KEYWORDS.has(word)) out += `<span class="t-key">${esc(text)}</span>`;
      else if (src[TOKEN.lastIndex] === '(') out += `<span class="t-fn">${esc(text)}</span>`;
      else out += esc(text);
    }
    last = TOKEN.lastIndex;
  }
  return out + esc(src.slice(last));
}
