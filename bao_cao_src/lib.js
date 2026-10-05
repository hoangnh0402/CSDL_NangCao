// Thư viện dựng báo cáo: style, khối nội dung, đánh số hình/bảng
const fs = require('fs');
const path = require('path');
const D = require('docx');
const {
  Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType,
  ShadingType, LevelFormat, HeadingLevel, VerticalAlign, TableLayoutType, HeightRule,
} = D;

const RES_DIR = 'D:/CSDL_NangCao/mongodb/results';
const FIG_DIR = path.join(__dirname, 'figs');
const TEXT_W = 8788; // DXA: A4 21cm - 3.5cm - 2cm
const FONT = 'Times New Roman';
// GDOCS=1: bản dành cho Google Docs (Google Docs không có font Consolas)
const GDOCS = process.env.GDOCS === '1';
const MONO = GDOCS ? 'Courier New' : 'Consolas';

// ---------------- kết quả chạy thực tế ----------------
const STEPS = {};
for (const f of fs.readdirSync(RES_DIR)) {
  if (!f.endsWith('.json')) continue;
  for (const g of JSON.parse(fs.readFileSync(path.join(RES_DIR, f), 'utf8'))) {
    for (const s of g.steps) STEPS[s.id] = s;
  }
}
function step(id) {
  if (!STEPS[id]) throw new Error('Không có bước ' + id);
  return STEPS[id];
}

// ---------------- đánh số hình, bảng ----------------
let chapter = 0;
const counters = { H: 0, B: 0 };
const labels = {};
function setChapter(n) { chapter = n; counters.H = 0; counters.B = 0; }
function nextLabel(kind, id) {
  counters[kind] += 1;
  const lbl = (kind === 'H' ? 'Hình ' : 'Bảng ') + chapter + '.' + counters[kind];
  if (id) labels[kind + ':' + id] = lbl;
  return lbl;
}
// Hai lượt: lượt 1 chỉ đánh số (dry run), lượt 2 dựng nội dung với nhãn đã biết
let DRY = true;
function setDry(v) { DRY = v; }
function resolveRefs(t) {
  return t.replace(/\{([HB]):([\w-]+)\}/g, (m, k, id) => {
    const l = labels[k + ':' + id];
    if (!l) { if (!DRY) throw new Error('Thiếu nhãn ' + m); return '??'; }
    return l;
  });
}

// ---------------- văn bản có định dạng nội tuyến ----------------
// **đậm**, *nghiêng*, `mã`
function runs(text, base = {}) {
  text = resolveRefs(text);
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new TextRun({ text: tok.slice(2, -2), bold: true, ...base }));
    else if (tok.startsWith('`')) out.push(new TextRun({ text: tok.slice(1, -1), font: MONO, size: 22, ...base }));
    else out.push(new TextRun({ text: tok.slice(1, -1), italics: true, ...base }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const body = [];
function push(...xs) { body.push(...xs); }
function take() { return body.splice(0, body.length); }

function h1(text, opts = {}) {
  push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], pageBreakBefore: opts.pageBreak !== false }));
}
function h2(text) { push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] })); }
function h3(text) { push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] })); }
function h4(text) { push(new Paragraph({ style: 'H4', children: runs(text) })); }
function p(text, opts = {}) {
  push(new Paragraph({ style: opts.style || 'Body', children: runs(text), keepNext: !!opts.keepNext,
    alignment: opts.align, indent: opts.noIndent ? { firstLine: 0 } : undefined }));
}
function pk(text) { p(text, { keepNext: true }); }
function bullets(items, level = 0) {
  for (const it of items) {
    push(new Paragraph({ style: 'Body', numbering: { reference: 'dash', level }, children: runs(it) }));
  }
}
function plusList(items) {
  for (const it of items) push(new Paragraph({ style: 'Body', numbering: { reference: 'plus', level: 0 }, children: runs(it) }));
}

// ---------------- khối mã và khối kết quả ----------------
const WRAP = GDOCS ? 86 : 88;
function wrapLine(line) {
  if (line.length <= WRAP) return [line];
  const ind = line.match(/^\s*/)[0] + '    ';
  const out = [];
  let cur = line;
  while (cur.length > WRAP) {
    let inQ = null, cut = -1;
    for (let i = 0; i < WRAP; i++) {
      const c = cur[i];
      if (inQ) { if (c === inQ) inQ = null; continue; }
      if (c === '"' || c === "'") { inQ = c; continue; }
      if ((c === ',' && cur[i + 1] === ' ') || (c === ' ' && i > ind.length + 8 && cur[i - 1] !== ',')) cut = c === ',' ? i + 1 : i;
    }
    // ưu tiên cắt sau dấu phẩy
    let commaCut = -1; inQ = null;
    for (let i = 0; i < WRAP; i++) {
      const c = cur[i];
      if (inQ) { if (c === inQ) inQ = null; continue; }
      if (c === '"' || c === "'") { inQ = c; continue; }
      if (c === ',' && cur[i + 1] === ' ') commaCut = i + 1;
    }
    if (commaCut > WRAP * 0.45) cut = commaCut;
    if (cut <= ind.length) cut = WRAP;
    out.push(cur.slice(0, cut).replace(/\s+$/, ''));
    cur = ind + cur.slice(cut).replace(/^\s+/, '');
  }
  out.push(cur);
  return out;
}
function block(lines, style) {
  const all = [];
  for (const l of lines) all.push(...wrapLine(l));
  const keep = all.length <= 10;
  all.forEach((l, i) => {
    push(new Paragraph({ style, keepNext: keep && i < all.length - 1, keepLines: true,
      spacing: i === all.length - 1 ? { after: 80 } : undefined,
      children: [new TextRun({ text: l === '' ? ' ' : l })] }));
  });
}
function code(text) { block(text.replace(/\s+$/, '').split('\n'), 'Code'); }
function cmd(id, opts = {}) {
  let c = step(id).command;
  if (opts.transform) c = opts.transform(c);
  code(c);
}
function trimOut(text, opts) {
  let lines = text.split('\n');
  if (opts.keep) {
    const o = [];
    for (const [a, b] of opts.keep) { if (o.length) o.push('  ...'); o.push(...lines.slice(a, b)); }
    lines = o;
  } else if (opts.head !== undefined && lines.length > opts.head + (opts.tail || 0)) {
    lines = [...lines.slice(0, opts.head), '  ...', ...(opts.tail ? lines.slice(-opts.tail) : [])];
  }
  return lines;
}
function out(id, opts = {}) {
  const s = step(id);
  let lines = trimOut(s.output, opts);
  if (opts.prefix) lines = [...opts.prefix, ...lines];
  block(lines, 'Output');
}

// ---------------- hình ----------------
function fig(id, file, title, widthPx, scale = 1) {
  const lbl = nextLabel('H', id);
  if (typeof widthPx === 'number') widthPx = Math.round(widthPx * scale);
  if (DRY) return;
  const buf = fs.readFileSync(path.join(FIG_DIR, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  // widthPx = 'native': ảnh vẽ ở 260 dpi -> hiển thị đúng kích thước inch thật
  const W = widthPx === 'native' ? Math.round(w / 260 * 96 * 0.92) : widthPx, H = Math.round(h * W / w);
  push(new Paragraph({ style: 'Figure', keepNext: true,
    children: [new ImageRun({ type: 'png', data: buf, transformation: { width: W, height: H },
      altText: { title: lbl, description: title, name: file } })] }));
  push(new Paragraph({ style: 'Hinh', children: [new TextRun({ text: lbl + '. ', bold: true }), ...runs(title)] }));
}
const TERM = JSON.parse(fs.readFileSync(path.join(FIG_DIR, 'terms.json'), 'utf8'));
function term(id, file, title) {
  // giữ cỡ chữ đồng nhất: 104 cột ứng với toàn bộ bề rộng trang
  const cols = TERM[file].cols;
  fig(id, file, title, Math.round(585 * Math.min(1, cols / 104)), 1);
}

// ---------------- bảng ----------------
const B1 = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const CELL_BORDERS = { top: B1, bottom: B1, left: B1, right: B1 };
function cellPara(text, o) {
  return new Paragraph({ style: 'Cell', alignment: o.align || AlignmentType.LEFT, keepNext: !!o.keepNext,
    children: runs(String(text), { bold: !!o.bold, font: o.mono ? MONO : undefined, size: o.mono ? 20 : undefined }) });
}
function tbl(id, title, headers, rows, rel, opts = {}) {
  const lbl = nextLabel('B', id);
  if (DRY) return;
  const tw = opts.width || TEXT_W;
  const sum = rel.reduce((a, b) => a + b, 0);
  const widths = rel.map(r => Math.floor(tw * r / sum));
  widths[widths.length - 1] += tw - widths.reduce((a, b) => a + b, 0);
  const align = opts.align || [];
  push(new Paragraph({ style: 'Bang', keepNext: true, children: [new TextRun({ text: lbl + '. ', bold: true }), ...runs(title)] }));
  const keepAll = rows.length <= 6;
  const mk = (cells, header, last) => new TableRow({
    tableHeader: header, cantSplit: true,
    children: cells.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, borders: CELL_BORDERS, verticalAlign: VerticalAlign.CENTER,
      shading: header ? { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' } : undefined,
      margins: { top: 40, bottom: 40, left: 90, right: 90 },
      children: String(c).split('\n').map(t => cellPara(t, header ? { bold: true, align: AlignmentType.CENTER, keepNext: true } :
        { align: align[i] === 'c' ? AlignmentType.CENTER : align[i] === 'r' ? AlignmentType.RIGHT : AlignmentType.LEFT, mono: (opts.mono || [])[i],
          keepNext: keepAll && !last })),
    })),
  });
  const trs = [];
  if (headers) trs.push(mk(headers, true));
  rows.forEach((r, k) => trs.push(mk(r, false, k === rows.length - 1)));
  push(new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: widths, alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED, rows: trs }));
  push(new Paragraph({ style: 'AfterTable', children: [] }));
}

// ---------------- style tài liệu ----------------
const LINE = 312; // 1,3 lines
const styles = {
  default: { document: { run: { font: FONT, size: 26 }, paragraph: { spacing: { line: LINE } } } },
  paragraphStyles: [
    { id: 'Body', name: 'Body Text Report', basedOn: 'Normal', quickFormat: true,
      paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 40, line: LINE }, indent: { firstLine: 567 } } },
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Body', quickFormat: true,
      run: { font: FONT, size: 28, bold: true, color: '000000' },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 300, line: LINE }, keepNext: true, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Body', quickFormat: true,
      run: { font: FONT, size: 26, bold: true, color: '000000' },
      paragraph: { spacing: { before: 160, after: 80, line: LINE }, keepNext: true, keepLines: true, outlineLevel: 1 } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Body', quickFormat: true,
      run: { font: FONT, size: 26, bold: true, italics: true, color: '000000' },
      paragraph: { spacing: { before: 120, after: 60, line: LINE }, keepNext: true, keepLines: true, outlineLevel: 2 } },
    { id: 'H4', name: 'Muc nho', basedOn: 'Normal', next: 'Body',
      run: { font: FONT, size: 26, italics: true },
      paragraph: { spacing: { before: 100, after: 60, line: LINE }, keepNext: true, indent: { firstLine: 567 } } },
    { id: 'TitleNoToc', name: 'Tieu de khong muc luc', basedOn: 'Normal',
      run: { font: FONT, size: 28, bold: true },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 300, line: LINE } } },
    { id: 'Code', name: 'Code Block', basedOn: 'Normal',
      run: { font: MONO, size: GDOCS ? 16 : 17 },
      paragraph: { spacing: { before: 0, after: 0, line: 240 }, indent: { left: 120, right: 120 },
        shading: { type: ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6', space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6', space: 4 },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6', space: 4 }, right: { style: BorderStyle.SINGLE, size: 4, color: 'A6A6A6', space: 4 } } } },
    { id: 'Output', name: 'Output Block', basedOn: 'Normal',
      run: { font: MONO, size: 16 },
      paragraph: { spacing: { before: 0, after: 0, line: 240 }, indent: { left: 120, right: 120 },
        border: { top: { style: BorderStyle.DASHED, size: 4, color: '7F7F7F', space: 4 }, bottom: { style: BorderStyle.DASHED, size: 4, color: '7F7F7F', space: 4 },
          left: { style: BorderStyle.DASHED, size: 4, color: '7F7F7F', space: 4 }, right: { style: BorderStyle.DASHED, size: 4, color: '7F7F7F', space: 4 } } } },
    { id: 'Figure', name: 'Figure Image', basedOn: 'Normal',
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40, line: 240 }, keepNext: true } },
    { id: 'Hinh', name: 'Chu thich Hinh', basedOn: 'Normal', next: 'Body',
      run: { font: FONT, size: 24 },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 140, line: 276 } } },
    { id: 'Bang', name: 'Chu thich Bang', basedOn: 'Normal', next: 'Body',
      run: { font: FONT, size: 24 },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60, line: 276 }, keepNext: true } },
    { id: 'Cell', name: 'Table Cell', basedOn: 'Normal',
      run: { font: FONT, size: 24 },
      paragraph: { spacing: { before: 0, after: 0, line: 252 } } },
    { id: 'AfterTable', name: 'After Table', basedOn: 'Normal',
      run: { size: 12 }, paragraph: { spacing: { before: 0, after: 80, line: 240 } } },
    { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal',
      run: { font: FONT, size: 26 }, paragraph: { spacing: { before: 60, after: 0, line: 288 } } },
    { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal',
      run: { font: FONT, size: 26 }, paragraph: { spacing: { before: 0, after: 0, line: 288 }, indent: { left: 284 } } },
    { id: 'TOC3', name: 'toc 3', basedOn: 'Normal', next: 'Normal',
      run: { font: FONT, size: 26, italics: true }, paragraph: { spacing: { before: 0, after: 0, line: 288 }, indent: { left: 567 } } },
    { id: 'Cover', name: 'Cover Text', basedOn: 'Normal',
      run: { font: FONT, size: 28, bold: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 312 } } },
    { id: 'Ref', name: 'Tai lieu tham khao', basedOn: 'Normal',
      paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 100, line: LINE }, indent: { left: 567, hanging: 567 } } },
  ],
};

const numbering = {
  config: [
    { reference: 'dash', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '-', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 851, hanging: 284 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '+', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1418, hanging: 284 } } } }] },
    { reference: 'plus', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '+', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 851, hanging: 284 } } } }] },
  ],
};

module.exports = { D, step, setChapter, setDry, labels, runs, push, take, h1, h2, h3, h4, p, pk, bullets, plusList,
  code, cmd, out, fig, term, tbl, styles, numbering, TEXT_W, FONT, MONO, GDOCS, resolveRefs, nextLabel };
