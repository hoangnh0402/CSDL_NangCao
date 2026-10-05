// Mở đầu và Chương 1
const L = require('./lib');
const { h1, h2, h3, h4, p, pk, bullets, code, cmd, out, fig, term, tbl, setChapter } = L;

const PRODUCT = [
  ['A', 1001, 'pc'], ['A', 1002, 'pc'], ['A', 1003, 'pc'], ['A', 2004, 'laptop'], ['A', 2005, 'laptop'], ['A', 2006, 'laptop'],
  ['B', 1004, 'pc'], ['B', 1005, 'pc'], ['B', 1006, 'pc'], ['B', 2007, 'laptop'], ['C', 1007, 'pc'],
  ['D', 1008, 'pc'], ['D', 1009, 'pc'], ['D', 1010, 'pc'], ['D', 3004, 'printer'], ['D', 3005, 'printer'],
  ['E', 1011, 'pc'], ['E', 1012, 'pc'], ['E', 1013, 'pc'], ['E', 2001, 'laptop'], ['E', 2002, 'laptop'], ['E', 2003, 'laptop'],
  ['E', 3001, 'printer'], ['E', 3002, 'printer'], ['E', 3003, 'printer'], ['F', 2008, 'laptop'], ['F', 2009, 'laptop'],
  ['G', 2010, 'laptop'], ['H', 3006, 'printer'], ['H', 3007, 'printer'],
];
const LAPTOP = [
  [2001, '2.00', 2048, 240, '20.1', 3673], [2002, '1.73', 1024, 80, '17.0', 949], [2003, '1.80', 512, 60, '15.4', 549],
  [2004, '2.00', 512, 60, '13.3', 1150], [2005, '2.16', 1024, 120, '17.0', 2500], [2006, '2.00', 2048, 80, '15.4', 1700],
  [2007, '1.83', 1024, 120, '13.3', 1429], [2008, '1.60', 1024, 100, '15.4', 900], [2009, '1.60', 512, 80, '14.1', 680],
  [2010, '2.00', 2048, 160, '15.4', 2300],
];
const PRINTER = [
  [3001, 'true', 'ink-jet', 99], [3002, 'false', 'laser', 239], [3003, 'true', 'laser', 899], [3004, 'true', 'ink-jet', 120],
  [3005, 'false', 'laser', 120], [3006, 'true', 'ink-jet', 100], [3007, 'true', 'laser', 200],
];

function moDau() {
  setChapter(0);
  h1('MỞ ĐẦU', { pageBreak: false });
  h2('1. Lý do lựa chọn đề tài');
  p('Khối lượng và mức độ đa dạng của dữ liệu tăng nhanh đặt ra yêu cầu cao đối với hệ quản trị cơ sở dữ liệu (CSDL) về tính linh hoạt của lược đồ, tính sẵn sàng và khả năng mở rộng. Với dữ liệu có cấu trúc không đồng nhất hoặc cần mở rộng theo chiều ngang, các hệ quản trị NoSQL – tiêu biểu là MongoDB – có nhiều ưu điểm nhờ mô hình dữ liệu hướng tài liệu (document) và các cơ chế phân tán tích hợp sẵn.');
  p('Bài toán quản lý thiết bị máy tính là ví dụ điển hình cho dữ liệu không đồng nhất: máy tính xách tay được mô tả bởi tốc độ, bộ nhớ, ổ cứng, màn hình, còn máy in được mô tả bởi khả năng in màu và công nghệ in. Mô hình quan hệ buộc phải tách nhiều bảng và nối bảng khi truy vấn, trong khi MongoDB biểu diễn tự nhiên bằng document và embedded document. Ngoài ra, hệ thống danh mục sản phẩm cần hoạt động liên tục và mở rộng khi dữ liệu tăng, nên sao chép (Replica Set) và phân mảnh (Sharding) là những nội dung quản trị then chốt.');
  p('Xuất phát từ những lý do trên, tiểu luận lựa chọn đề tài **“Xây dựng và quản trị cơ sở dữ liệu quản lý thiết bị máy tính với cơ chế sao chép và phân mảnh dữ liệu trên MongoDB”**. Đề tài giúp vận dụng tổng hợp kiến thức của học phần – từ mô hình hóa, truy vấn, tổng hợp dữ liệu đến CSDL phân tán – trên bộ dữ liệu kinh điển trích từ giáo trình [6].');
  h2('2. Mục tiêu nghiên cứu');
  bullets([
    'Phân tích bài toán quản lý thiết bị máy tính từ các bảng dữ liệu PRODUCT, LAPTOP, PRINTER; xác định các đối tượng và mối quan hệ giữa sản phẩm, máy tính xách tay và máy in.',
    'Phân tích, so sánh mô hình nhúng (Embedded) và mô hình tham chiếu (Reference); lựa chọn và thiết kế mô hình dữ liệu MongoDB phù hợp, có giải thích.',
    'Tạo lập cơ sở dữ liệu, nhập đầy đủ và chính xác dữ liệu nguồn; thực hiện các thao tác truy vấn, cập nhật và tổng hợp dữ liệu theo nghiệp vụ.',
    'Cấu hình cơ chế sao chép dữ liệu (Replica Set), kiểm tra sự đồng bộ giữa các nút và khả năng chuyển đổi dự phòng.',
    'Phân tích phương án phân bố dữ liệu, lựa chọn khóa phân mảnh, cấu hình phân mảnh (Sharding) và kiểm tra sự phân bố dữ liệu trên các nút; từ đó đánh giá kết quả quản trị dữ liệu trên MongoDB.',
  ]);
  h2('3. Đối tượng và phạm vi nghiên cứu');
  p('**Đối tượng nghiên cứu:** mô hình dữ liệu hướng tài liệu của MongoDB (document, embedded document, array, reference); ngôn ngữ truy vấn MongoDB và Aggregation Pipeline; cơ chế sao chép dữ liệu bằng Replica Set và cơ chế phân mảnh dữ liệu bằng Sharded Cluster.');
  p('**Phạm vi nghiên cứu:** dữ liệu ba bảng PRODUCT (30 bản ghi), LAPTOP (10) và PRINTER (7) theo [6]; MongoDB Community Server 8.0 triển khai bằng Docker trên một máy tính cá nhân, mô phỏng cụm 13 tiến trình máy chủ. Chương 3 đi theo **hướng 2 – triển khai CSDL phân tán** (sao chép và phân mảnh) phù hợp yêu cầu đề tài; bảo mật, tối ưu chỉ mục chuyên sâu và giao tác đa tài liệu nằm ngoài phạm vi.');
  h2('4. Kết quả mong muốn đạt được của đề tài');
  bullets([
    'Mô hình dữ liệu MongoDB được lựa chọn có lập luận rõ ràng; CSDL `QLThietBi` gồm hai collection `products` (30 document) và `makers` (8 document), có ràng buộc kiểm tra `$jsonSchema` và chỉ mục duy nhất.',
    'Bộ 16 yêu cầu khai thác dữ liệu theo nghiệp vụ được hiện thực bằng truy vấn `find`, Aggregation Pipeline và `$lookup`, kèm kết quả thực thi và phân tích.',
    'Replica Set ba nút hoạt động ổn định; kiểm chứng được sự đồng bộ dữ liệu giữa các nút và khả năng tự động bầu Primary mới khi có sự cố.',
    'Sharded Cluster gồm hai shard (mỗi shard là một Replica Set ba nút), Config Server Replica Set và bộ định tuyến mongos; dữ liệu được phân bố đúng theo khóa phân mảnh đã lựa chọn.',
  ]);
  h2('5. Cấu trúc báo cáo');
  p('Ngoài phần Mở đầu, Kết luận và Tài liệu tham khảo, báo cáo được tổ chức thành ba chương:');
  bullets([
    '**Chương 1. Phân tích và thiết kế cơ sở dữ liệu trên MongoDB:** phân tích bài toán, lựa chọn mô hình dữ liệu, thiết kế collection; tạo lập và thao tác dữ liệu.',
    '**Chương 2. Khai thác và tổng hợp dữ liệu trên MongoDB:** truy vấn theo nghiệp vụ, Aggregation Pipeline, `$lookup` và đánh giá kết quả.',
    '**Chương 3. Triển khai cơ sở dữ liệu phân tán trong MongoDB:** Replica Set, lựa chọn khóa phân mảnh, Sharded Cluster và đánh giá kết quả.',
  ]);
}

function chuong1() {
  setChapter(1);
  h1('CHƯƠNG 1. PHÂN TÍCH VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU TRÊN MONGODB');
  p('Chương 1 trình bày quá trình phân tích bài toán quản lý thiết bị máy tính dựa trên ba bảng dữ liệu nguồn PRODUCT, LAPTOP và PRINTER. Từ kết quả phân tích, chương xác định các đối tượng, mối quan hệ và các mẫu truy cập dữ liệu chính, sau đó so sánh hai cách tiếp cận mô hình hóa của MongoDB là nhúng (Embedded) và tham chiếu (Reference) để lựa chọn mô hình phù hợp. Phần cuối chương trình bày thiết kế chi tiết các collection, quá trình tạo lập cơ sở dữ liệu, nhập dữ liệu nguồn và các thao tác tìm kiếm, cập nhật trên document, embedded document và mảng.');

  // ================= 1.1
  h2('1.1. Phân tích bài toán và dữ liệu nguồn');
  h3('1.1.1. Mô tả bài toán và dữ liệu cần quản lý');
  p('Bài toán đặt ra là xây dựng cơ sở dữ liệu phục vụ quản lý danh mục thiết bị máy tính của một đơn vị kinh doanh, phân phối thiết bị. Đơn vị này cung cấp ba nhóm sản phẩm: máy tính để bàn (PC), máy tính xách tay (laptop) và máy in (printer) đến từ tám nhà sản xuất (NSX) được ký hiệu từ A đến H. Mỗi sản phẩm được nhận diện bởi một mã model duy nhất, thuộc về đúng một NSX và một loại sản phẩm. Với laptop, đơn vị cần quản lý cấu hình (tốc độ bộ xử lý, dung lượng RAM, dung lượng ổ cứng, kích thước màn hình) và giá bán; với máy in, cần quản lý khả năng in màu, công nghệ in và giá bán.');
  p('Dữ liệu nguồn gồm ba bảng được trích từ lược đồ cơ sở dữ liệu sản phẩm trong [6] (Figures 2.20–2.21). Bảng **PRODUCT(maker, model, type)** lưu mã NSX (A – H), mã model duy nhất và loại sản phẩm (pc, laptop, printer). Bảng **LAPTOP(model, speed, ram, hd, screen, price)** lưu tốc độ bộ xử lý (GHz), dung lượng RAM (MB), ổ cứng (GB), kích thước màn hình (inch) và giá bán (USD). Bảng **PRINTER(model, color, type, price)** lưu khả năng in màu (true/false), công nghệ in (ink-jet – phun mực, laser) và giá bán (USD). Thuộc tính model của LAPTOP và PRINTER tham chiếu tới PRODUCT. Dữ liệu cụ thể được trình bày trong {B:product}, {B:laptop} và {B:printer}.');
  const pr = [];
  for (let i = 0; i < 10; i++) pr.push([...PRODUCT[i], ...PRODUCT[i + 10], ...PRODUCT[i + 20]]);
  tbl('product', 'Dữ liệu bảng PRODUCT (30 bản ghi)', ['maker', 'model', 'type', 'maker', 'model', 'type', 'maker', 'model', 'type'], pr,
    [1, 1.1, 1.3, 1, 1.1, 1.3, 1, 1.1, 1.3], { align: Array(9).fill('c') });
  tbl('laptop', 'Dữ liệu bảng LAPTOP (10 bản ghi)', ['model', 'speed', 'ram', 'hd', 'screen', 'price'], LAPTOP,
    [1, 1, 1, 1, 1, 1], { align: Array(6).fill('c'), width: 7000 });
  tbl('printer', 'Dữ liệu bảng PRINTER (7 bản ghi)', ['model', 'color', 'type', 'price'], PRINTER,
    [1, 1, 1.2, 1], { align: Array(4).fill('c'), width: 5600 });

  p('Thống kê sơ bộ từ bảng PRODUCT ({B:thongke}) cho thấy 30 sản phẩm gồm 13 PC, 10 laptop và 7 máy in. NSX E có nhiều sản phẩm nhất (9 sản phẩm) và là NSX duy nhất cung cấp đủ cả ba loại; NSX C và G mỗi NSX chỉ có một sản phẩm.');
  const makers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const st = makers.map(m => {
    const c = t => PRODUCT.filter(r => r[0] === m && r[2] === t).length;
    return [m, c('pc'), c('laptop'), c('printer'), c('pc') + c('laptop') + c('printer')];
  });
  st.push(['Tổng', 13, 10, 7, 30]);
  tbl('thongke', 'Thống kê số sản phẩm theo nhà sản xuất và loại sản phẩm', ['NSX', 'pc', 'laptop', 'printer', 'Tổng'], st,
    [1, 1, 1, 1, 1], { align: Array(5).fill('c'), width: 6000 });
  pk('Qua khảo sát dữ liệu nguồn, có thể rút ra một số đặc điểm quan trọng ảnh hưởng tới thiết kế:');
  bullets([
    'Dữ liệu nguồn không có bảng chi tiết cho PC; 13 sản phẩm loại `pc` chỉ có ba thuộc tính maker, model, type. Theo yêu cầu đề tài, không tự ý bổ sung thuộc tính hay giá trị cho các sản phẩm này.',
    'Thuộc tính `type` xuất hiện với hai ý nghĩa khác nhau: PRODUCT.type là loại sản phẩm, còn PRINTER.type là công nghệ in. Khi hợp nhất dữ liệu cần tránh xung đột tên.',
    'Thuộc tính giá (price) chỉ có ở laptop và máy in; các thuộc tính cấu hình của laptop và máy in hoàn toàn khác nhau – dữ liệu có tính không đồng nhất (heterogeneous).',
    'Mọi model trong LAPTOP (2001–2010) và PRINTER (3001–3007) đều tồn tại trong PRODUCT với loại tương ứng; toàn vẹn tham chiếu giữa các bảng nguồn được thỏa mãn.',
    'Các giá trị speed như 2.00, 1.80 và screen như 17.0 là số thực; khi lưu bằng kiểu double, MongoDB hiển thị 2, 1.8, 17 nhưng giá trị không thay đổi.',
  ]);

  h3('1.1.2. Xác định các đối tượng và mối quan hệ');
  p('Từ mô tả bài toán và dữ liệu nguồn, các đối tượng (thực thể) cần quản lý được xác định như sau:');
  bullets([
    '**Nhà sản xuất (NSX):** được nhận diện bởi mã maker; trong dữ liệu nguồn NSX không có thêm thuộc tính nào khác ngoài mã.',
    '**Sản phẩm:** thực thể tổng quát, gồm model (khóa), maker và type.',
    '**Laptop, Máy in, PC:** các thực thể chuyên biệt của Sản phẩm. Laptop có speed, ram, hd, screen, price; Máy in có color, type, price; PC không có dữ liệu chi tiết.',
  ]);
  p('Giữa các đối tượng tồn tại hai loại mối quan hệ ({H:er}):');
  bullets([
    '**NSX – Sản phẩm (1 – N):** một NSX sản xuất nhiều sản phẩm, mỗi sản phẩm thuộc đúng một NSX. Theo dữ liệu, số sản phẩm của mỗi NSX dao động từ 1 (C, G) đến 9 (E).',
    '**Sản phẩm – Laptop / Máy in / PC (quan hệ tổng quát hóa – chuyên biệt hóa, ISA):** phân loại theo thuộc tính type; các lớp con rời nhau (một sản phẩm chỉ thuộc một loại) và toàn phần (mọi sản phẩm đều thuộc một loại). Giữa một sản phẩm và bản ghi chi tiết tương ứng là quan hệ 1 – 1.',
  ]);
  fig('er', 'h1_1_er.png', 'Sơ đồ thực thể – mối quan hệ của bài toán quản lý thiết bị máy tính', 'native');
  p('Khác với thiết kế quan hệ (xuất phát từ cấu trúc dữ liệu), thiết kế lược đồ trong MongoDB xuất phát từ cách ứng dụng truy cập dữ liệu [3], [4]. Vì vậy, bên cạnh các đối tượng và mối quan hệ, cần xác định các mẫu truy cập (access pattern) chính của nghiệp vụ như trong {B:truycap}.');
  tbl('truycap', 'Các mẫu truy cập dữ liệu chính của nghiệp vụ', ['Mã', 'Mẫu truy cập', 'Tần suất'], [
    ['TC1', 'Tra cứu một sản phẩm theo model, kèm đầy đủ cấu hình và giá', 'Rất thường xuyên'],
    ['TC2', 'Liệt kê các sản phẩm của một NSX', 'Thường xuyên'],
    ['TC3', 'Lọc sản phẩm theo loại và điều kiện cấu hình, giá', 'Thường xuyên'],
    ['TC4', 'Thống kê số lượng, giá theo NSX và loại sản phẩm', 'Định kỳ'],
    ['TC5', 'Xem danh mục (portfolio) sản phẩm của từng NSX', 'Thường xuyên'],
    ['TC6', 'Cập nhật giá, cấu hình của một sản phẩm', 'Thỉnh thoảng'],
    ['TC7', 'Bổ sung sản phẩm mới cho một NSX', 'Thỉnh thoảng'],
  ], [0.8, 5.2, 1.6], { align: ['c', 'l', 'c'] });
  pk('Đồng thời, các ràng buộc nghiệp vụ cần được bảo đảm gồm:');
  bullets([
    'Mỗi sản phẩm bắt buộc có maker, model, type; model là duy nhất trên toàn bộ danh mục.',
    'type chỉ nhận một trong ba giá trị pc, laptop, printer; giá bán (nếu có) không âm.',
    'Thông tin cấu hình phải phù hợp với loại sản phẩm: laptop có speed, ram, hd, screen; máy in có color và công nghệ in.',
  ]);

  // ================= 1.2
  h2('1.2. Phân tích và lựa chọn mô hình dữ liệu MongoDB');
  p('MongoDB lưu trữ dữ liệu dưới dạng các document BSON trong các collection. Lược đồ của collection linh hoạt: các document trong cùng collection có thể có tập trường khác nhau, và một trường có thể chứa document con (embedded document) hoặc mảng (array). Để biểu diễn mối quan hệ giữa các đối tượng, MongoDB cung cấp hai cách tiếp cận cơ bản là **nhúng dữ liệu** (embedding) và **tham chiếu dữ liệu** (referencing) [4], [7]. Nguyên tắc chung là: dữ liệu thường được truy cập cùng nhau thì nên được lưu cùng nhau.');
  h3('1.2.1. Phân tích khả năng sử dụng Embedded Model');
  p('Trong mô hình nhúng, dữ liệu liên quan được lưu trực tiếp bên trong một document dưới dạng embedded document hoặc mảng các embedded document. Với bài toán này có hai phương án nhúng khả dĩ ({H:embedded}):');
  bullets([
    '**Phương án N1 – nhúng theo sản phẩm:** mỗi sản phẩm là một document trong collection `products`; thông tin chi tiết của LAPTOP hoặc PRINTER được nhúng vào trường `specs`, giá được đưa lên cấp gốc.',
    '**Phương án N2 – nhúng theo NSX:** mỗi NSX là một document trong collection `makers`, chứa mảng `products` gồm toàn bộ sản phẩm của NSX đó cùng cấu hình và giá.',
  ]);
  fig('embedded', 'h1_2_embedded.png', 'Hai phương án mô hình nhúng (Embedded Model)', 'native');
  p('**Đánh giá phương án N1.** Quan hệ giữa sản phẩm và bản ghi chi tiết là 1 – 1, dữ liệu chi tiết luôn được đọc cùng sản phẩm (TC1, TC3) nên việc nhúng là tự nhiên: một lần đọc lấy đủ thông tin, không cần phép nối; thao tác ghi trên một sản phẩm là nguyên tử vì chỉ tác động lên một document. Phương án này áp dụng mẫu thiết kế đa hình (polymorphic pattern): các loại sản phẩm khác nhau cùng nằm trong một collection, mỗi loại có cấu trúc `specs` riêng; PC không có `specs` vẫn là document hợp lệ. Kích thước document nhỏ và ổn định.');
  p('**Đánh giá phương án N2.** Phương án này thuận lợi cho TC5 (xem danh mục của NSX) nhưng bộc lộ nhiều hạn chế: tra cứu một sản phẩm phải tìm trong mảng và dùng toán tử chiếu hoặc `$unwind`; cập nhật một phần tử mảng cần toán tử vị trí; mảng tăng không giới hạn khi NSX bổ sung sản phẩm (mẫu phản thiết kế “unbounded array”); toàn bộ dữ liệu chỉ nằm trong 8 document với kích thước chênh lệch lớn (E có 9 sản phẩm), gây khó khăn khi phân mảnh vì đơn vị phân bố nhỏ nhất là một document NSX.');
  h3('1.2.2. Phân tích khả năng sử dụng Reference/Normalized Model');
  p('Trong mô hình tham chiếu (chuẩn hóa), các đối tượng được lưu ở các collection riêng và liên kết với nhau thông qua giá trị khóa, tương tự khóa ngoại trong mô hình quan hệ. Áp dụng cho bài toán, phương án R ánh xạ trực tiếp ba bảng nguồn thành ba collection `products`, `laptops`, `printers`, liên kết qua trường `model` ({H:reference}).');
  fig('reference', 'h1_3_reference.png', 'Phương án mô hình tham chiếu (Reference Model)', 'native');
  p('**Ưu điểm** của phương án R là bám sát cấu trúc dữ liệu nguồn, không trùng lặp dữ liệu, mỗi collection nhỏ và có thể cập nhật độc lập. **Nhược điểm** là các mẫu truy cập chính TC1, TC3 đều cần kết hợp `products` với `laptops` hoặc `printers` bằng `$lookup`, làm tăng chi phí xử lý; MongoDB không kiểm tra ràng buộc khóa ngoại nên toàn vẹn tham chiếu phụ thuộc vào ứng dụng; việc thêm một sản phẩm cần ghi vào hai collection nên muốn bảo đảm nguyên tử phải dùng giao tác đa tài liệu; ngoài ra, khi các collection được phân mảnh, phép nối giữa các shard tốn thêm chi phí truyền dữ liệu qua mạng.');
  p('Mô hình tham chiếu phù hợp với quan hệ 1 – N có N lớn hoặc không giới hạn, quan hệ N – N, hoặc khi các đối tượng thường được truy cập độc lập. Trong bài toán, quan hệ NSX – Sản phẩm mang đặc điểm này hơn là quan hệ Sản phẩm – Laptop/Máy in.');
  h3('1.2.3. Lựa chọn và giải thích mô hình dữ liệu');
  p('{B:sosanh} tổng hợp kết quả so sánh ba phương án theo các mẫu truy cập và tiêu chí quản trị đã xác định.');
  tbl('sosanh', 'So sánh các phương án mô hình dữ liệu', ['Tiêu chí', 'N1 – nhúng theo sản phẩm', 'N2 – nhúng theo NSX', 'R – tham chiếu'], [
    ['Đọc một sản phẩm kèm cấu hình (TC1)', '1 document, không nối', 'Lọc trong mảng', 'Cần $lookup'],
    ['Lọc theo cấu hình, giá (TC3)', 'Truy vấn trực tiếp, đánh chỉ mục được', 'Cần $unwind', 'Cần $lookup'],
    ['Thống kê theo NSX, loại (TC4)', '$group trực tiếp', '$unwind rồi $group', '$group (+ $lookup nếu cần giá)'],
    ['Xem danh mục của NSX (TC5)', 'Lọc theo maker', '1 document', 'Lọc theo maker'],
    ['Tính nguyên tử khi ghi', '1 document', '1 document lớn dần', 'Nhiều document'],
    ['Kích thước document', 'Nhỏ, ổn định', 'Tăng theo số sản phẩm', 'Nhỏ'],
    ['Khả năng phân mảnh', 'Tốt (maker, model ở cấp gốc)', 'Kém (chỉ 8 document)', 'Trung bình (nối liên shard)'],
  ], [2.6, 2.5, 2.1, 2.1], { align: ['l', 'l', 'l', 'l'] });
  p('Trên cơ sở phân tích, tiểu luận lựa chọn **mô hình kết hợp (hybrid)** giữa nhúng và tham chiếu:');
  bullets([
    '**Collection chính `products` theo phương án N1:** thông tin chi tiết LAPTOP/PRINTER được nhúng vào embedded document `specs` (quan hệ 1 – 1, luôn đọc cùng nhau); giá `price` đặt ở cấp gốc để truy vấn, thống kê giá thống nhất cho mọi loại. Tên thuộc tính gốc được giữ nguyên, kể cả PRINTER.type được giữ thành `specs.type` – không xung đột với `type` ở cấp gốc vì nằm ở cấp lồng khác nhau.',
    '**Collection phụ `makers` theo hướng tham chiếu:** mỗi NSX là một document có mảng `products` gồm các phần tử `{ model, type }`; trong đó `model` là tham chiếu tới `products.model` và `type` được lưu kèm theo mẫu tham chiếu mở rộng (extended reference) để trả lời nhanh câu hỏi “NSX có những loại sản phẩm nào”. Mảng có kích thước nhỏ (tối đa 9 phần tử), phục vụ TC5 và các truy vấn kết hợp bằng `$lookup`.',
    'Collection `makers` không chứa dữ liệu mới: nó được sinh hoàn toàn từ dữ liệu PRODUCT bằng Aggregation Pipeline, bảo đảm khớp với dữ liệu nguồn.',
  ]);
  p('Sự đánh đổi của lựa chọn này là quan hệ NSX – Sản phẩm được lưu ở hai nơi (trường `maker` của `products` và mảng `products` của `makers`), do đó khi bổ sung sản phẩm mới cần cập nhật cả hai collection trong cùng một giao tác hoặc sinh lại `makers` bằng `$merge`. Với đặc thù danh mục sản phẩm có tần suất đọc cao và ít thay đổi (TC6, TC7 chỉ “thỉnh thoảng”), sự đánh đổi này là hợp lý.');

  // ================= 1.3
  h2('1.3. Thiết kế cấu trúc cơ sở dữ liệu MongoDB');
  h3('1.3.1. Xác định các collection và mối liên kết');
  p('Cơ sở dữ liệu được đặt tên `QLThietBi`, gồm hai collection ({H:model}): `products` (30 document) lưu sản phẩm cùng cấu hình nhúng và giá, nhận diện bởi `model` (chỉ mục duy nhất), liên kết tới NSX qua `maker → makers._id`; `makers` (8 document) lưu danh mục sản phẩm theo NSX với `_id` là mã NSX, liên kết tới sản phẩm qua `products.model → products.model`.');
  fig('model', 'h1_4_model.png', 'Mô hình dữ liệu MongoDB được lựa chọn', 'native');
  p('Việc ánh xạ từ các bảng nguồn sang cấu trúc MongoDB được trình bày trong {B:anhxa}. Có thể thấy toàn bộ thuộc tính nguồn đều có vị trí tương ứng, không thuộc tính nào bị loại bỏ hay đổi tên.');
  tbl('anhxa', 'Ánh xạ thuộc tính nguồn sang cấu trúc MongoDB', ['Thuộc tính nguồn', 'Vị trí trong MongoDB'], [
    ['PRODUCT.maker', 'products.maker; makers._id'],
    ['PRODUCT.model', 'products.model; makers.products[].model'],
    ['PRODUCT.type', 'products.type; makers.products[].type'],
    ['LAPTOP.model, PRINTER.model', 'Hợp nhất với products.model (quan hệ 1 – 1)'],
    ['LAPTOP.speed, ram, hd, screen', 'products.specs.speed, .ram, .hd, .screen'],
    ['PRINTER.color, PRINTER.type', 'products.specs.color, products.specs.type'],
    ['LAPTOP.price, PRINTER.price', 'products.price'],
  ], [3.2, 4.8], { align: ['l', 'l'] });
  h3('1.3.2. Thiết kế document, embedded document, array và reference');
  p('Cấu trúc document của collection `products` được mô tả trong {B:products}. Đây là document đa hình: trường `specs` là embedded document có cấu trúc phụ thuộc vào `type`.');
  tbl('products', 'Cấu trúc document của collection products', ['Trường', 'Kiểu BSON', 'Bắt buộc', 'Mô tả'], [
    ['_id', 'ObjectId', 'Tự sinh', 'Khóa nội bộ do MongoDB sinh tự động'],
    ['maker', 'string', 'Có', 'Mã NSX; tham chiếu makers._id'],
    ['model', 'number', 'Có', 'Mã model; chỉ mục duy nhất uq_model'],
    ['type', 'string', 'Có', 'Loại sản phẩm: "pc" | "laptop" | "printer"'],
    ['specs', 'object', 'Không', 'Embedded document. Laptop: { speed, ram, hd, screen }; máy in: { color, type }; PC: không có'],
    ['price', 'number', 'Không', 'Giá bán (USD), ≥ 0; chỉ có ở laptop và máy in'],
  ], [1.2, 1.3, 1.1, 5.2], { align: ['l', 'c', 'c', 'l'], mono: [true, false, false, false] });
  p('Document của collection `makers` gồm `_id` (string – mã NSX) và `products` (array) – mảng các embedded document `{ model: number, type: string }`, trong đó `model` tham chiếu tới `products.model`.');
  p('`model` được giữ là trường nghiệp vụ riêng (không dùng làm `_id`) để bám sát dữ liệu nguồn, tính duy nhất được bảo đảm bằng chỉ mục `uq_model`. Ràng buộc nghiệp vụ được khai báo bằng `$jsonSchema` ở mức collection (`validationLevel: "strict"`, `validationAction: "error"`). Giá trị số được lưu bằng kiểu double mặc định của mongosh – biểu diễn chính xác với dữ liệu giá là số nguyên nhỏ; hệ thống tài chính thực tế nên cân nhắc kiểu Decimal128.');
  h3('1.3.3. Minh họa các document mẫu');
  pk('Các document đại diện cho ba loại sản phẩm trong `products` và một document của `makers` (dạng đã nhập vào cơ sở dữ liệu):');
  code(`// products – PC (không có specs, không có price)
{ maker: "A", model: 1001, type: "pc" }
// products – laptop (specs là embedded document)
{ maker: "E", model: 2001, type: "laptop",
  specs: { speed: 2.00, ram: 2048, hd: 240, screen: 20.1 },
  price: 3673 }
// products – máy in (specs.type là công nghệ in)
{ maker: "E", model: 3003, type: "printer",
  specs: { color: true, type: "laser" },
  price: 899 }
// makers – NSX E (products là mảng các tham chiếu)
{ _id: "E",
  products: [ { model: 1011, type: "pc" },      { model: 1012, type: "pc" },
              { model: 1013, type: "pc" },      { model: 2001, type: "laptop" },
              { model: 2002, type: "laptop" },  { model: 2003, type: "laptop" },
              { model: 3001, type: "printer" }, { model: 3002, type: "printer" },
              { model: 3003, type: "printer" } ] }`);

  // ================= 1.4
  h2('1.4. Tạo lập và thao tác dữ liệu');
  p('Môi trường thực nghiệm được mô tả trong {B:moitruong}. Toàn bộ lệnh trong mục này được thực hiện bằng mongosh kết nối tới nút Primary `mongo1` của Replica Set `rs0` (cấu hình chi tiết của Replica Set trình bày ở mục 3.1). Kết quả trình bày trong báo cáo là kết quả thực thi thực tế; các khối lệnh có nền xám, các khối kết quả có viền nét đứt.');
  tbl('moitruong', 'Môi trường thực nghiệm', ['Thành phần', 'Phiên bản / cấu hình'], [
    ['Hệ quản trị CSDL', 'MongoDB Community Server 8.0.32 (Docker image mongo:8.0)'],
    ['Công cụ dòng lệnh', 'mongosh 2.12.0'],
    ['Nền tảng triển khai', 'Docker Engine 28.5.1, Docker Compose; Windows 11 Pro'],
    ['Cụm sao chép', 'Replica Set rs0: mongo1, mongo2, mongo3 (cổng 27017)'],
    ['Cụm phân mảnh', 'cfgrs (3 nút) + shard1rs (3 nút) + shard2rs (3 nút) + mongos'],
    ['Cơ sở dữ liệu', 'QLThietBi'],
  ], [2.6, 5.4], { align: ['l', 'l'] });

  h3('1.4.1. Tạo collection và nhập dữ liệu');
  h4('Bước 1: Tạo collection products với bộ kiểm tra dữ liệu');
  pk('Chọn cơ sở dữ liệu `QLThietBi` (MongoDB tạo cơ sở dữ liệu khi có collection đầu tiên) và tạo collection `products` kèm bộ kiểm tra `$jsonSchema`:');
  cmd('use_db');
  cmd('create_products');
  pk('Kết quả:');
  out('create_products');
  h4('Bước 2: Tạo chỉ mục duy nhất trên model');
  cmd('index_model');
  out('index_model');
  h4('Bước 3: Nhập dữ liệu nguồn');
  pk('Dữ liệu ba bảng nguồn được hợp nhất và nhập vào `products` bằng một lệnh `insertMany` gồm 30 document, đúng thứ tự và giá trị của bảng PRODUCT; với laptop và máy in, các thuộc tính chi tiết được nhúng vào `specs`:');
  cmd('insert_products', { transform: c => c.replace(/, specs:/g, ',\n    specs:') });
  pk('MongoDB xác nhận ghi thành công (`acknowledged: true`, sinh 30 ObjectId). Kiểm tra số lượng document tổng và theo loại:');
  out('insert_products', { head: 3, tail: 2 });
  cmd('count_all');
  out('count_all');
  cmd('count_by_type');
  out('count_by_type');
  p('Có 30 document gồm 13 PC, 10 laptop và 7 máy in – khớp hoàn toàn với {B:thongke}.');
  h4('Bước 4: Tạo collection makers từ dữ liệu products');
  pk('Collection `makers` được sinh bằng Aggregation Pipeline: sắp xếp theo model, nhóm theo maker, đẩy từng cặp `{ model, type }` vào mảng và ghi kết quả ra collection bằng `$out`:');
  cmd('build_makers');
  pk('Kiểm tra kết quả – số phần tử mảng `products` của từng NSX:');
  cmd('makers_list');
  out('makers_list');
  p('Số phần tử mảng của từng NSX (6, 4, 1, 5, 9, 2, 1, 2) khớp với cột “Tổng” của {B:thongke}, chứng tỏ `makers` phản ánh chính xác dữ liệu PRODUCT.');
  h4('Bước 5: Kiểm tra các ràng buộc toàn vẹn');
  p('Hai thao tác ghi vi phạm ràng buộc được thử nghiệm ({H:rangbuoc}): (1) thêm sản phẩm có `type: "tablet"` không thuộc tập giá trị cho phép – bị bộ kiểm tra `$jsonSchema` từ chối với thông báo “Document failed validation” và chỉ rõ thuộc tính vi phạm; (2) thêm sản phẩm trùng model 1001 – bị chỉ mục duy nhất `uq_model` từ chối với lỗi E11000. Cả hai thao tác đều không làm thay đổi dữ liệu.');
  term('rangbuoc', 't1_rang_buoc.png', 'Kết quả kiểm tra ràng buộc $jsonSchema và chỉ mục duy nhất');

  h3('1.4.2. Thực hiện tìm kiếm và cập nhật dữ liệu');
  h4('a) Tìm kiếm dữ liệu');
  pk('Tra cứu một sản phẩm theo model (TC1) bằng `findOne` – toàn bộ thông tin cấu hình và giá được trả về trong một document:');
  cmd('findone_2001');
  out('findone_2001');
  pk('Liệt kê sản phẩm của NSX B (TC2) với phép chiếu chỉ lấy các trường cần thiết:');
  cmd('find_maker_B');
  out('find_maker_B');
  p('Ba PC của B không có trường `price` trong kết quả vì dữ liệu nguồn không có giá cho PC – mô hình document cho phép bỏ qua trường không có giá trị thay vì lưu giá trị rỗng (null).');
  h4('b) Cập nhật dữ liệu');
  p('Đề tài yêu cầu không được thay đổi dữ liệu nguồn, vì vậy mỗi thao tác cập nhật dưới đây đều được thực hiện để minh họa, kiểm tra kết quả, sau đó **hoàn tác về giá trị gốc**. Cập nhật giá laptop 2002 bằng `updateOne` với toán tử `$set`:');
  cmd('update_one');
  out('update_one', { keep: [[0, 1], [3, 5], [6, 7]] });
  cmd('update_one_check');
  out('update_one_check');
  pk('Hoàn tác về giá gốc 949 bằng lệnh tương tự với `{ $set: { price: 949 } }`. Tiếp theo, cập nhật nhiều document: tăng giá 10 USD cho tất cả máy in laser bằng `updateMany` với toán tử `$inc` (điều kiện lọc dùng ký hiệu dấu chấm trên embedded document):');
  cmd('update_many');
  out('update_many', { keep: [[0, 1], [3, 5], [6, 7]] });
  cmd('update_many_check');
  out('update_many_check');
  p('Bốn máy in laser (3002, 3003, 3005, 3007) đều được tăng giá; thao tác được hoàn tác bằng `updateMany` cùng điều kiện với `{ $inc: { price: -10 } }`.');
  p('Bộ kiểm tra `$jsonSchema` cũng áp dụng cho thao tác cập nhật: lệnh `updateOne({ model: 3001 }, { $set: { price: -5 } })` bị từ chối với lỗi “Document failed validation” do vi phạm điều kiện `minimum: 0`.');
  p('Cuối cùng, sau toàn bộ các thao tác minh họa ở mục 1.4.2 và 1.4.3, tổng số lượng và tổng giá theo loại được kiểm tra lại. Tổng giá laptop 15830 và tổng giá máy in 1777 trùng khớp với tổng cột price của {B:laptop} và {B:printer}, khẳng định dữ liệu đã được khôi phục chính xác:');
  cmd('verify_restore');
  out('verify_restore');

  h3('1.4.3. Thao tác với embedded document và array');
  h4('a) Truy vấn và cập nhật embedded document');
  pk('Truy vấn trên trường của embedded document dùng ký hiệu dấu chấm (dot notation). Tìm laptop có RAM từ 2048 MB:');
  cmd('embed_ram');
  out('embed_ram');
  pk('Tìm máy in màu sử dụng công nghệ laser – kết hợp hai điều kiện trên embedded document; kết quả gồm hai máy in 3003 (E, 899 USD) và 3007 (H, 200 USD):');
  cmd('embed_color_laser');
  p('Toán tử `$exists` cho phép lọc theo sự tồn tại của embedded document: `countDocuments({ specs: { $exists: false } })` trả về 13 – đúng bằng số PC.');
  pk('Cập nhật một trường bên trong embedded document chỉ tác động tới trường đó, các trường khác của `specs` được giữ nguyên. Thao tác được hoàn tác ngay sau đó và kiểm tra lại:');
  cmd('embed_update');
  cmd('verify_2003', { transform: c => '// sau khi hoàn tác bằng { $set: { "specs.screen": 15.4 } }\n' + c });
  out('verify_2003');
  h4('b) Truy vấn và cập nhật mảng');
  pk('Truy vấn trên mảng embedded document của `makers`: điều kiện `"products.type": "printer"` đúng khi ít nhất một phần tử mảng thỏa mãn – kết quả là các NSX có sản xuất máy in:');
  cmd('arr_printer_makers');
  out('arr_printer_makers');
  p('{H:mang} minh họa ba toán tử mảng: `$elemMatch` yêu cầu **cùng một phần tử** thỏa mãn đồng thời nhiều điều kiện (laptop có model từ 2008 – kết quả F, G); `$size` lọc theo số phần tử mảng (NSX chỉ có một sản phẩm – C, G); `$all` yêu cầu mảng chứa đủ các giá trị (NSX có cả ba loại sản phẩm – chỉ có E).');
  term('mang', 't1_mang.png', 'Kết quả truy vấn mảng với $elemMatch, $size và $all');
  pk('Toán tử `$addToSet` chỉ thêm phần tử nếu phần tử đó chưa tồn tại. Thêm lại phần tử `{ model: 1007, type: "pc" }` vào NSX C không làm thay đổi dữ liệu (`modifiedCount: 0`):');
  cmd('arr_addtoset');
  out('arr_addtoset', { keep: [[0, 1], [3, 5], [6, 7]] });
  pk('Toán tử `$push` thêm phần tử vào cuối mảng và `$pull` loại bỏ phần tử theo điều kiện. Thêm một phần tử thử nghiệm vào NSX G rồi loại bỏ:');
  cmd('arr_push');
  out('arr_push_check', { prefix: ['// db.makers.findOne({ _id: "G" }) sau $push'] });
  cmd('arr_pull');
  out('arr_pull_check', { prefix: ['// db.makers.findOne({ _id: "G" }) sau $pull'] });

  h2('Kết luận Chương 1');
  p('Chương 1 đã phân tích bài toán quản lý thiết bị máy tính và dữ liệu nguồn gồm 30 sản phẩm, 10 laptop và 7 máy in; xác định các đối tượng NSX, Sản phẩm, Laptop, Máy in, PC cùng quan hệ 1 – N giữa NSX và Sản phẩm, quan hệ chuyên biệt hóa (1 – 1) giữa Sản phẩm và các loại cụ thể. Trên cơ sở so sánh mô hình nhúng và mô hình tham chiếu theo các mẫu truy cập, tiểu luận lựa chọn mô hình kết hợp: collection `products` nhúng thông tin cấu hình vào `specs`, collection `makers` lưu mảng tham chiếu tới sản phẩm. Cơ sở dữ liệu `QLThietBi` đã được tạo lập với ràng buộc `$jsonSchema` và chỉ mục duy nhất; dữ liệu nguồn được nhập đầy đủ, chính xác và được kiểm chứng bằng thống kê. Các thao tác tìm kiếm, cập nhật trên document, embedded document và mảng đều thực hiện thành công, dữ liệu được khôi phục nguyên trạng sau các thao tác minh họa – là nền tảng cho việc khai thác dữ liệu ở Chương 2.');
}

module.exports = { moDau, chuong1 };
