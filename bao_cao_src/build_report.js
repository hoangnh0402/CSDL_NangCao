const fs = require('fs');
const L = require('./lib');
const { D } = L;
const { Document, Packer, Paragraph, TextRun, Header, PageNumber, AlignmentType, NumberFormat } = D;
const F = require('./content_front');
const C1 = require('./content_ch1');
const C2 = require('./content_ch2');
const C3 = require('./content_ch3');

const OUT = process.argv[2] || 'BaoCao.docx';

function mainContent() {
  C1.moDau();
  C1.chuong1();
  C2.chuong2();
  C3.chuong3();
  C3.ketLuan();
  C3.taiLieu();
}

// Lượt 1: đánh số hình/bảng để các tham chiếu chéo {H:..}/{B:..} có nhãn
L.setDry(true);
F.frontMatter(); L.take();
mainContent(); L.take();
// Lượt 2: dựng nội dung thật
L.setDry(false);
F.frontMatter();
const front = L.take();
mainContent();
const main = L.take();

const page = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1417, bottom: 1134, left: 1984, right: 1134, header: 709, footer: 567 },
};
const header = () => new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
  children: [new TextRun({ children: [PageNumber.CURRENT], size: 26 })] })] });

const doc = new Document({
  creator: 'Nguyễn Huy Hoàng',
  title: 'Tiểu luận CSDL nâng cao – Đề tài 5',
  description: 'Xây dựng và quản trị CSDL quản lý thiết bị máy tính với cơ chế sao chép và phân mảnh dữ liệu trên MongoDB',
  styles: L.styles,
  numbering: L.numbering,
  features: { updateFields: true },
  sections: [
    { properties: { page }, children: F.cover() },
    { properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } } },
      headers: { default: header() }, children: front },
    { properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } },
      headers: { default: header() }, children: main },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('Đã ghi', OUT, buf.length, 'bytes');
  console.log('Nhãn:', Object.keys(L.labels).length);
});
