// Bìa, bìa lót và các trang đầu
const L = require('./lib');
const { D } = L;
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign,
  HeightRule, TableLayoutType, TableOfContents, PageBreak } = D;

const INFO = {
  hocVien: 'NGUYỄN HUY HOÀNG',
  maHV: '2026700148',
  lop: '20261IT7305002 - THẠC SĨ KHÓA 16 ĐỢT 2',
  nganh: 'HỆ THỐNG THÔNG TIN',
  gv: 'TS. NGUYỄN THỊ HỒNG LOAN',
  deTai: 'XÂY DỰNG VÀ QUẢN TRỊ CƠ SỞ DỮ LIỆU QUẢN LÝ THIẾT BỊ MÁY TÍNH VỚI CƠ CHẾ SAO CHÉP VÀ PHÂN MẢNH DỮ LIỆU TRÊN MONGODB',
};

function coverPage() {
  const S = { style: BorderStyle.SINGLE, size: 12, color: '000000' };
  const N = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const cp = (text, o = {}) => new Paragraph({ style: 'Cover', alignment: o.align, indent: o.indent,
    spacing: o.spacing, children: [new TextRun({ text, size: o.size, bold: o.bold !== false })] });
  const row = (children, height, first, last, vAlign) => new TableRow({
    cantSplit: true, height: { value: height, rule: L.GDOCS ? HeightRule.ATLEAST : HeightRule.EXACT },
    children: [new TableCell({ width: { size: L.TEXT_W, type: WidthType.DXA }, verticalAlign: vAlign || VerticalAlign.TOP,
      borders: { top: first ? S : N, bottom: last ? S : N, left: S, right: S },
      margins: { left: 200, right: 200 }, children })] });
  const infoIndent = { left: 900 };
  return new Table({
    width: { size: L.TEXT_W, type: WidthType.DXA }, columnWidths: [L.TEXT_W], layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [
      row([cp('ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI', { spacing: { before: 300 } }),
        cp('TRƯỜNG CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG'),
        new Paragraph({ style: 'Cover', indent: { left: 2600, right: 2600 }, spacing: { after: 0 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000', space: 1 } }, children: [] })], 1800, true),
      row([cp('TIỂU LUẬN CƠ SỞ DỮ LIỆU NÂNG CAO'), cp('KẾT THÚC HỌC PHẦN')], 2700, false, false, VerticalAlign.CENTER),
      row([cp('ĐỀ TÀI', { spacing: { after: 200 } }),
        cp(INFO.deTai, { size: 30, indent: { left: 300, right: 300 }, spacing: { line: 360 } })], 3700, false, false, VerticalAlign.CENTER),
      row([cp('HỌC VIÊN: ' + INFO.hocVien, { align: AlignmentType.LEFT, indent: infoIndent }),
        cp('MÃ HỌC VIÊN: ' + INFO.maHV, { align: AlignmentType.LEFT, indent: infoIndent }),
        cp('LỚP: ' + INFO.lop, { align: AlignmentType.LEFT, indent: infoIndent }),
        cp('NGÀNH: ' + INFO.nganh, { align: AlignmentType.LEFT, indent: infoIndent }),
        cp('GIẢNG VIÊN: ' + INFO.gv, { align: AlignmentType.LEFT, indent: infoIndent })], 3400, false, false, VerticalAlign.CENTER),
      row([cp('Hà Nội – Năm 2026', { spacing: { after: 300 } })], 1800, false, true, VerticalAlign.BOTTOM),
    ],
  });
}

function cover() {
  const tiny = () => new Paragraph({ spacing: { before: 0, after: 0, line: 240 }, children: [new TextRun({ text: '', size: 2 }), new PageBreak()] });
  return [coverPage(), tiny(), coverPage()];
}

function frontMatter() {
  const { h1, p, push } = L;
  // ---- LỜI CẢM ƠN
  h1('LỜI CẢM ƠN', { pageBreak: false });
  p('Trước tiên, em xin gửi lời cảm ơn chân thành và sâu sắc tới TS. Nguyễn Thị Hồng Loan – giảng viên học phần Cơ sở dữ liệu nâng cao, Trường Công nghệ Thông tin và Truyền thông, Đại học Công nghiệp Hà Nội. Trong suốt quá trình học tập và thực hiện tiểu luận, giảng viên đã tận tình truyền đạt kiến thức, định hướng nội dung nghiên cứu và đưa ra những góp ý quý báu giúp em hoàn thiện báo cáo này.');
  p('Em cũng xin gửi lời cảm ơn tới các thầy cô Trường Công nghệ Thông tin và Truyền thông đã tạo điều kiện thuận lợi về môi trường học tập và nghiên cứu, cùng các anh chị, bạn bè trong lớp đã trao đổi, chia sẻ kinh nghiệm trong suốt quá trình học tập.');
  p('Mặc dù đã cố gắng hoàn thành tiểu luận với tất cả sự nỗ lực của bản thân, song do thời gian và kiến thức còn hạn chế nên báo cáo khó tránh khỏi những thiếu sót. Em rất mong nhận được những ý kiến đóng góp của giảng viên để em tiếp tục hoàn thiện kiến thức của mình.');
  p('Em xin chân thành cảm ơn!');
  const sig = (t, o = {}) => push(new Paragraph({ style: 'Body', alignment: AlignmentType.CENTER, indent: { left: 4300, firstLine: 0 },
    spacing: { before: o.before || 0, after: 0 }, children: [new TextRun({ text: t, italics: !!o.i, bold: !!o.b })] }));
  sig('Hà Nội, ngày …… tháng …… năm 2026', { i: true, before: 240 });
  sig('Học viên thực hiện', { b: true });
  sig(' ', {}); sig(' ', {}); sig(' ', {});
  sig('Nguyễn Huy Hoàng', { b: true });

  // ---- MỤC LỤC
  push(new Paragraph({ style: 'TitleNoToc', pageBreakBefore: true, children: [new TextRun('MỤC LỤC')] }));
  push(new Paragraph({ style: 'Body', alignment: AlignmentType.RIGHT, indent: { firstLine: 0 }, children: [new TextRun({ text: 'Trang', bold: true })] }));
  push(new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }));

  // ---- DANH MỤC THUẬT NGỮ, VIẾT TẮT
  h1('DANH MỤC CÁC THUẬT NGỮ, KÝ HIỆU VÀ CÁC CHỮ VIẾT TẮT');
  abbrevTable();

  // ---- DANH MỤC HÌNH VẼ
  h1('DANH MỤC HÌNH VẼ');
  push(new TableOfContents('Danh mục hình vẽ', { hyperlink: true, stylesWithLevels: [{ styleName: 'Chu thich Hinh', level: 1 }] }));
  // ---- DANH MỤC BẢNG BIỂU
  h1('DANH MỤC BẢNG BIỂU');
  push(new TableOfContents('Danh mục bảng biểu', { hyperlink: true, stylesWithLevels: [{ styleName: 'Chu thich Bang', level: 1 }] }));
}

function abbrevTable() {
  const { push } = L;
  const rows = [
    ['Aggregation Pipeline', 'Aggregation Pipeline', 'Đường ống tổng hợp dữ liệu gồm nhiều giai đoạn (stage) xử lý nối tiếp'],
    ['BSON', 'Binary JSON', 'Định dạng nhị phân MongoDB dùng để lưu trữ document'],
    ['Chunk', 'Chunk', 'Khối dữ liệu ứng với một khoảng giá trị liên tục của khóa phân mảnh'],
    ['Config server', 'Config Server', 'Máy chủ cấu hình, lưu siêu dữ liệu (metadata) của cụm phân mảnh'],
    ['CRUD', 'Create, Read, Update, Delete', 'Các thao tác tạo, đọc, cập nhật và xóa dữ liệu'],
    ['CSDL', '–', 'Cơ sở dữ liệu'],
    ['Document', 'Document', 'Tài liệu – đơn vị lưu trữ dữ liệu cơ bản của MongoDB'],
    ['JSON', 'JavaScript Object Notation', 'Định dạng biểu diễn dữ liệu dạng văn bản'],
    ['mongos', 'MongoDB Shard Router', 'Bộ định tuyến truy vấn trong cụm phân mảnh'],
    ['mongosh', 'MongoDB Shell', 'Công cụ dòng lệnh tương tác với MongoDB'],
    ['NSX', '–', 'Nhà sản xuất'],
    ['Oplog', 'Operations Log', 'Nhật ký thao tác dùng để sao chép dữ liệu trong Replica Set'],
    ['Primary / Secondary', 'Primary / Secondary', 'Nút chính (nhận thao tác ghi) / nút phụ (sao chép dữ liệu)'],
    ['Replica Set', 'Replica Set', 'Tập bản sao – nhóm tiến trình mongod cùng duy trì một tập dữ liệu'],
    ['Shard', 'Shard', 'Phân mảnh – nút (Replica Set) lưu một phần dữ liệu của cụm'],
    ['Shard key', 'Shard Key', 'Khóa phân mảnh, quyết định document thuộc chunk/shard nào'],
    ['Sharded Cluster', 'Sharded Cluster', 'Cụm phân mảnh gồm các shard, config server và mongos'],
    ['YC', '–', 'Yêu cầu khai thác dữ liệu theo nghiệp vụ'],
    ['Zone', 'Zone', 'Vùng – nhóm shard được gán một hoặc nhiều khoảng giá trị khóa phân mảnh'],
  ];
  // bảng danh mục không đánh số, không đưa vào danh mục bảng biểu
  const { D: { Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign, TableLayoutType } } = L;
  const w = [2300, 2600, L.TEXT_W - 4900];
  const B = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
  const cell = (t, i, h) => new TableCell({ width: { size: w[i], type: WidthType.DXA }, borders: { top: B, bottom: B, left: B, right: B },
    verticalAlign: VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 90, right: 90 },
    shading: h ? { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({ style: 'Cell', alignment: h ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: t, bold: h || i === 0 })] })] });
  const trs = [new TableRow({ tableHeader: true, children: ['Thuật ngữ / Viết tắt', 'Tiếng Anh', 'Ý nghĩa'].map((t, i) => cell(t, i, true)) })];
  for (const r of rows) trs.push(new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, i, false)) }));
  push(new Table({ width: { size: L.TEXT_W, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED, rows: trs }));
}

module.exports = { cover, frontMatter, INFO };
