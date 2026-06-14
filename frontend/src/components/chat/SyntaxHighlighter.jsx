import React from 'react';

const C = {
  keyword: '#C678DD',
  string: '#98C379',
  number: '#D19A66',
  comment: '#5C6370',
  type: '#E5C07B',
  func: '#61AFEF',
  operator: '#56B6C2',
  punct: '#ABB2BF',
  prop: '#E06C75',
  builtin: '#56B6C2',
  plain: '#ABB2BF',
};

const ALIASES = {
  js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
  py: 'python', rs: 'rust', go: 'go',
  java: 'java', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp',
  html: 'html', htm: 'html', css: 'css', scss: 'css', sass: 'css',
  json: 'javascript', xml: 'html', svg: 'html',
  bash: 'bash', sh: 'bash', zsh: 'bash', shell: 'bash',
  sql: 'sql', yaml: 'yaml', yml: 'yaml', md: 'markdown', markdown: 'markdown',
};

const KW = {};

KW.javascript = new Set('async await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while with yield'.split(' '));

KW.typescript = new Set([...'abstract as declare enum implements interface keyof module namespace private protected public readonly satisfies type'.split(' '), ...KW.javascript]);

KW.jsx = KW.javascript;
KW.tsx = KW.typescript;

KW.python = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self'.split(' '));

KW.html = new Set('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd label legend li link main map mark meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr'.split(' '));

KW.sql = new Set('SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE DROP ALTER ADD COLUMN AND OR NOT IN LIKE BETWEEN IS NULL JOIN LEFT RIGHT INNER OUTER FULL CROSS ON AS ORDER BY GROUP HAVING LIMIT OFFSET UNION ALL DISTINCT COUNT SUM AVG MIN MAX EXISTS CASE WHEN THEN ELSE END ASC DESC INDEX VIEW TRIGGER PROCEDURE FUNCTION RETURNS BEGIN COMMIT ROLLBACK GRANT REVOKE PRIMARY KEY FOREIGN REFERENCES CONSTRAINT DEFAULT CHECK UNIQUE'.split(' '));

KW.bash = new Set('if then else elif fi for while do done case esac in function return break continue export local readonly declare unset exit source cd echo printf exec eval set shift trap wait let'.split(' '));

KW.rust = new Set('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while'.split(' '));

KW.go = new Set('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'.split(' '));

KW.java = new Set('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null'.split(' '));

KW.c = new Set('auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while include define ifdef ifndef endif undef error line'.split(' '));

KW.cpp = new Set([...'alignas alignof and and_eq bitand bitor bool catch class compl concept constexpr const_cast decltype delete explicit export false friend inline mutable namespace new noexcept not not_eq nullptr operator or or_eq override private protected public reinterpret_cast requires static_cast template this throw true try typename using virtual xor xor_eq'.split(' '), ...KW.c]);

const BI = {};

BI.javascript = new Set('console window document Math JSON Set Map WeakSet WeakMap Promise Proxy Reflect ArrayBuffer SharedArrayBuffer Intl Int8Array Uint8Array Uint16Array Int16Array Uint32Array Int32Array Float32Array Float64Array Array Object String Number Boolean Symbol BigInt Error TypeError ReferenceError RangeError SyntaxError EvalError URIError Date RegExp globalThis parseFloat parseInt isNaN isFinite decodeURI encodeURI decodeURIComponent encodeURIComponent setTimeout setInterval clearTimeout clearInterval fetch localStorage sessionStorage'.split(' '));

BI.typescript = BI.javascript;
BI.jsx = BI.javascript;
BI.tsx = BI.javascript;

BI.python = new Set('print len range type int str float list dict tuple set bool bytes bytearray memoryview slice super object property staticmethod classmethod enumerate zip map filter sorted reversed open input isinstance issubclass hasattr getattr setattr delattr vars dir id repr abs all any bin chr ord complex divmod eval exec format frozenset globals locals hash hex iter max min next oct pow round sum'.split(' '));

BI.rust = new Set('println eprintln print eprint format writeln write dbg panic unreachable unimplemented todo assert assert_eq assert_ne vec Some None Ok Err Box Rc Arc Cell RefCell Mutex RwLock String Vec HashMap HashSet BTreeMap BTreeSet LinkedList VecDeque BinaryHeap Result Option Iterator IntoIterator Collect FromIterator Clone Copy Debug Display Eq PartialEq Ord PartialOrd Hash Default Drop Send Sync Sized ToString AsRef AsMut Into From TryInto TryFrom'.split(' '));

BI.go = new Set('append cap close copy delete len make new panic print println recover real imag complex error nil true false iota fmt'.split(' '));

BI.java = new Set('System String Integer Boolean Double Float Long Short Byte Character Math Object Class Throwable Exception RuntimeException Error Thread Runnable Comparable List ArrayList Map HashMap Set HashSet Collection Collections Arrays Optional Stream Collectors StringBuilder StringBuffer Iterator Iterable Enumeration Objects'.split(' '));

const TYPES = {};

TYPES.typescript = new Set('string number boolean void never any unknown null undefined bigint symbol object never Record Partial Required Readonly Pick Omit Exclude Extract NonNullable ReturnType InstanceType Parameters'.split(' '));

TYPES.python = new Set('int float str bool bytes bytearray list dict tuple set frozenset None Any Optional Union Callable TypeVar Generic Protocol TypedDict Literal Final ClassVar Iterable Iterator Sequence Mapping MutableMapping'.split(' '));

TYPES.java = new Set('byte short int long float double boolean char void String Object Integer Boolean Double Float Long Short Byte Character Class'.split(' '));

TYPES.rust = new Set('i8 i16 i32 i64 i128 u8 u16 u32 u64 u128 f32 f64 bool char str String Vec HashMap HashSet BTreeMap BTreeSet Option Result Box Rc Arc Cell RefCell Mutex RwLock Cow usize isize'.split(' '));

TYPES.go = new Set('bool string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 uintptr float32 float64 complex64 complex128 byte rune error any comparable'.split(' '));

TYPES.javascript = new Set('Array Object String Number Boolean Symbol BigInt Error Date RegExp Map Set WeakMap WeakSet Promise Intl ArrayBuffer SharedArrayBuffer Int8Array Uint8Array Uint16Array Int16Array Uint32Array Int32Array Float32Array Float64Array'.split(' '));

const MULTI_OPS = ['=>', '++', '--', '===', '!==', '<=', '>=', '&&', '||', '??', '?.', '**', '<<', '>>', '>>>'];
const SINGLE_OPS = ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~', ':'];
const PUNCT = new Set([';', ',', '(', ')', '{', '}', '[', ']']);

function tidy(code) {
  return typeof code === 'string' ? code : String(code || '');
}

function fetch(lang, map) {
  return (map && map[lang]) || new Set();
}

function tokensOf(code, lang) {
  const out = [];
  let i = 0;
  const len = code.length;

  const kw = fetch(lang, KW);
  const bi = fetch(lang, BI);
  const ty = fetch(lang, TYPES);

  const isHtml = lang === 'html';
  const isPy = lang === 'python';
  const isBash = lang === 'bash';
  const isYaml = lang === 'yaml';
  const isCss = lang === 'css';
  const isSql = lang === 'sql';
  const isRust = lang === 'rust';
  const isMarkdown = lang === 'markdown';

  function add(text, type) {
    if (text) out.push({ text, type });
  }

  function wordType(w, afterIdx) {
    if (kw.has(w)) return 'keyword';
    if (ty.has(w)) return 'type';
    if (bi.has(w)) return 'builtin';
    if (/^[A-Z]/.test(w) && w.length > 1) return 'type';
    let j = afterIdx;
    while (j < len && code[j] === ' ') j++;
    if (j < len && code[j] === '(') return 'func';
    return 'plain';
  }

  while (i < len) {
    if (isHtml && code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      if (end !== -1) {
        add(code.slice(i, end + 3), 'comment');
        i = end + 3;
        continue;
      }
    }

    if (code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i + 2);
      if (end !== -1) {
        add(code.slice(i, end + 2), 'comment');
        i = end + 2;
        continue;
      }
      add(code.slice(i), 'comment');
      i = len;
      continue;
    }

    if (code.startsWith('//', i)) {
      const nl = code.indexOf('\n', i);
      add(nl === -1 ? code.slice(i) : code.slice(i, nl), 'comment');
      i = nl === -1 ? len : nl;
      continue;
    }

    if ((isPy || isBash || isYaml) && code[i] === '#') {
      const nl = code.indexOf('\n', i);
      add(nl === -1 ? code.slice(i) : code.slice(i, nl), 'comment');
      i = nl === -1 ? len : nl;
      continue;
    }

    if (isSql && code.startsWith('--', i)) {
      const nl = code.indexOf('\n', i);
      add(nl === -1 ? code.slice(i) : code.slice(i, nl), 'comment');
      i = nl === -1 ? len : nl;
      continue;
    }

    if (isMarkdown && i + 2 < len && code[i] === '`' && code[i + 1] === '`' && code[i + 2] === '`') {
      const end = code.indexOf('```', i + 3);
      if (end !== -1) {
        add(code.slice(i, end + 3), 'string');
        i = end + 3;
        continue;
      }
    }

    if (isMarkdown && code[i] === '`') {
      const end = code.indexOf('`', i + 1);
      if (end !== -1) {
        add(code.slice(i, end + 1), 'string');
        i = end + 1;
        continue;
      }
    }

    if (isPy && code.startsWith('"""', i)) {
      const end = code.indexOf('"""', i + 3);
      if (end !== -1) {
        add(code.slice(i, end + 3), 'string');
        i = end + 3;
        continue;
      }
    }

    if (isPy && code.startsWith("'''", i)) {
      const end = code.indexOf("'''", i + 3);
      if (end !== -1) {
        add(code.slice(i, end + 3), 'string');
        i = end + 3;
        continue;
      }
    }

    if (code[i] === '`') {
      const end = code.indexOf('`', i + 1);
      if (end !== -1) {
        add(code.slice(i, end + 1), 'string');
        i = end + 1;
        continue;
      }
    }

    if (code[i] === '"') {
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '"') { j++; break; }
        j++;
      }
      add(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    if (code[i] === "'") {
      let j = i + 1;
      while (j < len) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === "'") { j++; break; }
        j++;
      }
      add(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    if (isCss && code[i] === '#') {
      const hex = code.slice(i).match(/^#[\da-fA-F]{3,8}\b/);
      if (hex) {
        add(hex[0], 'number');
        i += hex[0].length;
        continue;
      }
    }

    if (isCss) {
      const unit = code.slice(i).match(/^\d+(?:px|em|rem|vh|vw|%|pt|cm|mm|in|ex|ch|vmin|vmax|deg|rad|grad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)\b/);
      if (unit) {
        add(unit[0], 'number');
        i += unit[0].length;
        continue;
      }
    }

    const numMatch = code.slice(i).match(/^0[xX][\da-fA-F]+|^0[bB][01]+|^0[oO][0-7]+|^\d+\.?\d*(?:[eE][+-]?\d+)?/);
    if (numMatch && /[\d.]/.test(code[i])) {
      add(numMatch[0], 'number');
      i += numMatch[0].length;
      continue;
    }

    if (isPy && code[i] === '@') {
      const decMatch = code.slice(i).match(/^@[\w.]+(?:\([^)]*\))?/);
      if (decMatch) {
        add(decMatch[0], 'keyword');
        i += decMatch[0].length;
        continue;
      }
    }

    if ((isHtml || lang === 'jsx' || lang === 'tsx') && code[i] === '<') {
      if (i + 1 < len && code[i + 1] === '/') {
        const closeMatch = code.slice(i).match(/^<\/([a-zA-Z][\w.-]*)\s*>/);
        if (closeMatch) {
          add('</', 'punct');
          add(closeMatch[1], 'keyword');
          add('>', 'punct');
          i += closeMatch[0].length;
          continue;
        }
        i++;
        continue;
      }
      const tagMatch = code.slice(i).match(/^<([a-zA-Z][\w.-]*)/);
      if (tagMatch) {
        add('<', 'punct');
        add(tagMatch[1], 'keyword');
        i += tagMatch[0].length;
        if (code[i] === '>' || (code[i] === '/' && code[i + 1] === '>')) {
          if (code[i] === '/') { add('/>', 'punct'); i += 2; }
          else { add('>', 'punct'); i++; }
        }
        continue;
      }
    }

    if ((isHtml || lang === 'jsx' || lang === 'tsx') && /[a-zA-Z]/.test(code[i])) {
      const attrMatch = code.slice(i).match(/^([a-zA-Z][\w.-]*)\s*=\s*["']/);
      if (attrMatch) {
        add(attrMatch[1], 'prop');
        i += attrMatch[0].length - 1;
        continue;
      }
    }

    if (isRust && code[i] === '#') {
      if (i + 1 < len && (code[i + 1] === '!' || code[i + 1] === '[')) {
        const endBracket = code.indexOf(']', i + 2);
        if (endBracket !== -1) {
          add(code.slice(i, endBracket + 1), 'keyword');
          i = endBracket + 1;
          continue;
        }
      }
    }

    if ((isHtml || lang === 'jsx' || lang === 'tsx') && i + 1 < len && code[i] === '/' && code[i + 1] === '>') {
      add('/>', 'punct');
      i += 2;
      continue;
    }

    if ((isHtml || lang === 'jsx' || lang === 'tsx') && code[i] === '>') {
      add('>', 'punct');
      i++;
      continue;
    }

    if (code[i] === '.' && i + 1 < len && /[a-zA-Z_$]/.test(code[i + 1])) {
      const propMatch = code.slice(i).match(/^\.\s*[a-zA-Z_$][\w$]*/);
      if (propMatch) {
        add(propMatch[0], 'prop');
        i += propMatch[0].length;
        continue;
      }
    }

    let opMatch = null;
    for (const op of MULTI_OPS) {
      if (code.startsWith(op, i)) {
        opMatch = op;
        break;
      }
    }
    if (opMatch) {
      add(opMatch, 'operator');
      i += opMatch.length;
      continue;
    }

    if (SINGLE_OPS.includes(code[i])) {
      add(code[i], 'operator');
      i++;
      continue;
    }

    if (PUNCT.has(code[i])) {
      add(code[i], 'punct');
      i++;
      continue;
    }

    const idMatch = code.slice(i).match(/^[a-zA-Z_$][\w$]*/);
    if (idMatch) {
      const w = idMatch[0];
      const type = wordType(w, i + w.length);
      add(w, type);
      i += w.length;
      continue;
    }

    if (code[i] === ' ' || code[i] === '\t' || code[i] === '\n' || code[i] === '\r') {
      let ws = '';
      while (i < len && (code[i] === ' ' || code[i] === '\t' || code[i] === '\n' || code[i] === '\r')) {
        ws += code[i];
        i++;
      }
      add(ws, 'plain');
      continue;
    }

    add(code[i], 'plain');
    i++;
  }

  return out;
}

function detectLanguage(code) {
  const t = code.trim();
  if (!t) return 'text';

  if (/^<\w|^<!DOCTYPE/i.test(t)) return 'html';
  if (/^(def |class .*:|import \w+|from \w+ |print\s*\()/m.test(t)) return 'python';
  if (/^(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(t)) return 'sql';
  if (/^(#!|export |echo |source )/m.test(t)) return 'bash';
  if (/^(---\s*$|[\w.-]+:\s)/m.test(t)) return 'yaml';
  if (/^#{1,6}\s/m.test(t)) return 'markdown';
  if (/^[{[]/.test(t) && /"[^"]*"\s*:/.test(t)) return 'json';
  if (/\bfn\s+\w+/.test(t) && /\blet\s+/.test(t)) return 'rust';
  if (/\bfunc\s+\w+/.test(t) && /\bpackage\s+\w+/.test(t)) return 'go';
  if (/\bpublic\s+(class|interface|void)\b/.test(t) || /System\.out\.print/.test(t)) return 'java';
  if (/#include\s*[<"]/.test(t)) return /std::|template\s*<|using\s+namespace/.test(t) ? 'cpp' : 'c';
  if (/\binterface\s+\w+|\btype\s+\w+\s*=/.test(t)) return 'typescript';
  if (/\bfunction\b|\bconst\b|\blet\b|\bvar\b/.test(t)) return 'javascript';
  return 'text';
}

export const SyntaxHighlighter = ({ code, language }) => {
  const rendered = React.useMemo(() => {
    const clean = tidy(code);
    if (!clean) return null;

    const lang = language
      ? (ALIASES[language.toLowerCase().trim()] || language.toLowerCase().trim())
      : detectLanguage(clean);

    const supported = KW[lang] ? lang : 'text';
    if (supported === 'text') return clean;

    const tokens = tokensOf(clean, supported);
    if (!tokens.length) return null;

    const spans = [];
    for (let idx = 0; idx < tokens.length; idx++) {
      const { text, type } = tokens[idx];
      const color = C[type] || C.plain;
      if (type === 'keyword') {
        spans.push(React.createElement('span', { key: idx, style: { color, fontWeight: 600 } }, text));
      } else {
        spans.push(React.createElement('span', { key: idx, style: { color } }, text));
      }
    }
    return spans;
  }, [code, language]);

  if (!rendered) return null;
  if (typeof rendered === 'string') return React.createElement(React.Fragment, null, rendered);
  return React.createElement(React.Fragment, null, rendered);
};
