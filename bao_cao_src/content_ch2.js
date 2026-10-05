// Chương 2
const L = require('./lib');
const { h1, h2, h3, h4, p, pk, bullets, code, cmd, out, fig, term, tbl, setChapter } = L;

function chuong2() {
  setChapter(2);
  h1('CHƯƠNG 2. KHAI THÁC VÀ TỔNG HỢP DỮ LIỆU TRÊN MONGODB');
  p('Trên cơ sở dữ liệu đã được thiết kế và tạo lập ở Chương 1, Chương 2 tập trung vào việc khai thác dữ liệu phục vụ nghiệp vụ quản lý thiết bị máy tính. Trước hết, chương xác định danh sách 16 yêu cầu khai thác điển hình và hiện thực các yêu cầu tra cứu bằng phương thức `find`. Tiếp theo, chương trình bày việc tổng hợp dữ liệu bằng Aggregation Pipeline với các stage lọc, chiếu, nhóm, sắp xếp và phân khúc. Cuối cùng, chương sử dụng `$lookup` để kết hợp hai collection `makers` và `products`, đồng thời phân tích, đánh giá kết quả khai thác so với dữ liệu nguồn.');

  // ================= 2.1
  h2('2.1. Xây dựng và thực hiện các yêu cầu truy vấn');
  h3('2.1.1. Xác định các yêu cầu khai thác theo nghiệp vụ');
  p('Từ các mẫu truy cập TC1 – TC7 đã xác định ở {B:truycap}, 16 yêu cầu khai thác dữ liệu (YC) được xây dựng, bao quát các nhu cầu tư vấn bán hàng, báo cáo thống kê và phân tích danh mục sản phẩm ({B:yeucau}).');
  tbl('yeucau', 'Danh sách yêu cầu khai thác dữ liệu theo nghiệp vụ', ['Mã', 'Yêu cầu nghiệp vụ', 'Kỹ thuật MongoDB', 'Mục'], [
    ['YC1', 'Liệt kê laptop giá dưới 1.000 USD, sắp xếp theo giá tăng dần', 'find, $lt, sort', '2.1.2'],
    ['YC2', 'Tìm các NSX có laptop với ổ cứng từ 100 GB trở lên', 'distinct, dot notation', '2.1.2'],
    ['YC3', 'Tìm laptop màn hình từ 15,4 inch và RAM từ 1024 MB', 'find, điều kiện kết hợp', '2.1.2'],
    ['YC4', 'Liệt kê sản phẩm của NSX E có giá từ 200 đến 1.000 USD', 'find, $gte, $lte, countDocuments', '2.1.2'],
    ['YC5', 'Báo cáo cấu hình laptop: quy đổi RAM sang GB, phân loại hiệu năng', '$match, $project, $divide, $cond', '2.2.1'],
    ['YC6', 'Danh sách máy in kèm công nghệ và nhãn chế độ in', '$match, $project, $cond', '2.2.1'],
    ['YC7', 'Thống kê số sản phẩm theo NSX và loại', '$group (khóa ghép), $sum', '2.2.2'],
    ['YC8', 'Thống kê giá laptop theo NSX: trung bình, thấp nhất, cao nhất', '$group, $avg, $min, $max', '2.2.2'],
    ['YC9', 'Thống kê theo loại sản phẩm: số lượng, tổng giá, giá trung bình', '$group, $cond, $ifNull', '2.2.2'],
    ['YC10', 'Tìm dung lượng ổ cứng xuất hiện ở từ hai laptop trở lên', '$group, $match sau nhóm', '2.2.2'],
    ['YC11', 'Tìm 3 sản phẩm có giá cao nhất', '$sort, $limit', '2.2.3'],
    ['YC12', 'Phân khúc laptop theo khoảng giá', '$bucket', '2.2.3'],
    ['YC13', 'Tìm NSX bán laptop nhưng không bán PC; NSX có từ hai loại sản phẩm', '$addToSet, $all, $nin, $size', '2.2.3'],
    ['YC14', 'Tổng hợp danh mục laptop của từng NSX từ collection makers', '$lookup, $filter', '2.3.1'],
    ['YC15', 'Bổ sung quy mô danh mục của NSX cho từng máy in', '$lookup, $unwind', '2.3.1'],
    ['YC16', 'Thống kê số máy in màu và giá máy in thấp nhất theo NSX', '$lookup (let, pipeline), $expr', '2.3.1'],
  ], [0.8, 4.3, 2.6, 0.8], { align: ['c', 'l', 'l', 'c'] });

  h3('2.1.2. Thực hiện và phân tích kết quả truy vấn');
  h4('YC1 – Laptop giá dưới 1.000 USD, sắp xếp theo giá tăng dần');
  pk('Yêu cầu phục vụ tư vấn khách hàng ở phân khúc giá thấp. Điều kiện lọc kết hợp loại sản phẩm và giá; phép chiếu lấy các thông số cấu hình chính trong `specs`:');
  cmd('yc1');
  pk('Kết quả thực thi gồm 4 document ({B:yc1}):');
  tbl('yc1', 'Kết quả YC1 – laptop giá dưới 1.000 USD', ['maker', 'model', 'specs.speed', 'specs.ram', 'specs.hd', 'price'], [
    ['E', 2003, 1.8, 512, 60, 549], ['F', 2009, 1.6, 512, 80, 680], ['F', 2008, 1.6, 1024, 100, 900], ['E', 2002, 1.73, 1024, 80, 949],
  ], [0.9, 0.9, 1.45, 1.35, 1.25, 0.9], { align: Array(6).fill('c'), width: 8000 });
  p('Có 4 laptop thỏa mãn, rẻ nhất là model 2003 của E (549 USD). Truy vấn tương đương trong SQL cần phép nối hai bảng: `SELECT maker, model, speed, ram, hd, price FROM Product NATURAL JOIN Laptop WHERE price < 1000 ORDER BY price;` – trong mô hình đã chọn, nhờ cấu hình được nhúng vào `specs`, MongoDB chỉ cần đọc một collection.');
  h4('YC2 – Các NSX có laptop với ổ cứng từ 100 GB trở lên');
  pk('Phương thức `distinct` trả về danh sách giá trị không trùng lặp của một trường; kết quả gồm 5 NSX (ứng với các laptop 2005, 2007, 2001, 2008, 2010):');
  cmd('yc2');
  out('yc2');
  h4('YC3 – Laptop màn hình từ 15,4 inch và RAM từ 1024 MB');
  pk('Hai điều kiện trên hai trường của embedded document được kết hợp ngầm định theo phép AND; kết quả sắp xếp giảm dần theo kích thước màn hình, sau đó theo giá:');
  cmd('yc3');
  pk('Kết quả thực thi gồm 6 document ({B:yc3}):');
  tbl('yc3', 'Kết quả YC3 – laptop màn hình từ 15,4 inch và RAM từ 1024 MB', ['maker', 'model', 'specs.ram', 'specs.screen', 'price'], [
    ['E', 2001, 2048, 20.1, 3673], ['A', 2005, 1024, 17, 2500], ['E', 2002, 1024, 17, 949],
    ['G', 2010, 2048, 15.4, 2300], ['A', 2006, 2048, 15.4, 1700], ['F', 2008, 1024, 15.4, 900],
  ], [0.9, 0.9, 1.3, 1.45, 0.9], { align: Array(5).fill('c'), width: 7000 });
  p('Laptop 2001 của E có màn hình lớn nhất (20,1 inch) và giá cao nhất; khi cùng kích thước màn hình, giá giảm dần quyết định thứ tự.');
  h4('YC4 – Sản phẩm của NSX E có giá từ 200 đến 1.000 USD');
  pk('Điều kiện khoảng được biểu diễn bằng hai toán tử `$gte` và `$lte` trên cùng một trường; kết quả gồm 4 document (kiểm tra lại bằng `countDocuments` cũng trả về 4):');
  cmd('yc4');
  out('yc4');
  p('Các PC của E không xuất hiện do không có trường `price` – điều kiện so sánh trên trường không tồn tại cho kết quả sai, đúng ngữ nghĩa nghiệp vụ.');

  // ================= 2.2
  h2('2.2. Tổng hợp dữ liệu bằng Aggregation Pipeline');
  p('Aggregation Pipeline là cơ chế tổng hợp dữ liệu của MongoDB, trong đó dữ liệu đi qua một chuỗi các giai đoạn (stage); đầu ra của stage trước là đầu vào của stage sau ({H:pipeline}). Mỗi stage thực hiện một phép biến đổi [3], [7]: `$match` lọc document (tương đương WHERE/HAVING), `$project` chọn và tính trường mới (SELECT), `$group` nhóm và tính giá trị tổng hợp (GROUP BY), `$sort`/`$limit` sắp xếp, giới hạn (ORDER BY/LIMIT), `$bucket` phân nhóm theo khoảng, `$unwind` tách mảng, `$lookup` kết hợp collection (LEFT OUTER JOIN) và `$out` ghi kết quả ra collection.');
  fig('pipeline', 'h2_1_pipeline.png', 'Luồng xử lý Aggregation Pipeline của yêu cầu YC8', 'native');
  h3('2.2.1. Lọc và lựa chọn dữ liệu với $match, $project');
  h4('YC5 – Báo cáo cấu hình laptop');
  pk('Stage `$match` lọc laptop; stage `$project` đưa các trường lồng trong `specs` lên cấp gốc với tên tiếng Việt, quy đổi RAM từ MB sang GB bằng `$divide` và phân loại hiệu năng bằng biểu thức điều kiện `$cond` (tốc độ từ 2,0 GHz là “Hiệu năng cao”):');
  cmd('yc5');
  pk('Kết quả thực thi gồm 10 document, được trình bày lại dưới dạng bảng trong {B:yc5}.');
  tbl('yc5', 'Kết quả YC5 – báo cáo cấu hình laptop', ['model', 'maker', 'tocDo', 'ramGB', 'oCung', 'manHinh', 'price', 'phanLoai'], [
    [2001, 'E', 2, 2, 240, 20.1, 3673, 'Hiệu năng cao'],
    [2002, 'E', 1.73, 1, 80, 17, 949, 'Phổ thông'],
    [2003, 'E', 1.8, 0.5, 60, 15.4, 549, 'Phổ thông'],
    [2004, 'A', 2, 0.5, 60, 13.3, 1150, 'Hiệu năng cao'],
    [2005, 'A', 2.16, 1, 120, 17, 2500, 'Hiệu năng cao'],
    [2006, 'A', 2, 2, 80, 15.4, 1700, 'Hiệu năng cao'],
    [2007, 'B', 1.83, 1, 120, 13.3, 1429, 'Phổ thông'],
    [2008, 'F', 1.6, 1, 100, 15.4, 900, 'Phổ thông'],
    [2009, 'F', 1.6, 0.5, 80, 14.1, 680, 'Phổ thông'],
    [2010, 'G', 2, 2, 160, 15.4, 2300, 'Hiệu năng cao'],
  ], [0.95, 0.9, 0.9, 1.05, 0.95, 1.2, 0.85, 1.7], { align: ['c', 'c', 'c', 'c', 'c', 'c', 'c', 'l'] });
  p('Năm laptop thuộc nhóm “Hiệu năng cao” (2001, 2004, 2005, 2006, 2010); RAM chỉ gồm ba mức 0,5 GB, 1 GB và 2 GB. Phép tính được thực hiện ngay tại máy chủ CSDL.');
  h4('YC6 – Danh sách máy in kèm nhãn chế độ in');
  pk('Biểu thức `$cond` chuyển giá trị logic `specs.color` thành nhãn “In màu” / “Đen trắng”; kết quả sắp xếp theo giá:');
  cmd('yc6');
  p('Kết quả gồm 7 máy in theo thứ tự giá tăng dần: 3001 (E, ink-jet, In màu, 99), 3006 (H, ink-jet, In màu, 100), 3004 (D, ink-jet, In màu, 120), 3005 (D, laser, Đen trắng, 120), 3007 (H, laser, In màu, 200), 3002 (E, laser, Đen trắng, 239), 3003 (E, laser, In màu, 899). Máy in phun mực đều in màu và có giá thấp (99 – 120 USD); máy in laser có cả loại màu và đen trắng với dải giá rộng hơn (120 – 899 USD).');

  h3('2.2.2. Nhóm và tính toán với $group, $sum, $avg');
  h4('YC7 – Số sản phẩm theo NSX và loại');
  pk('Khóa nhóm `_id` là một document ghép gồm maker và type; `$sum: 1` đếm số document trong mỗi nhóm:');
  cmd('yc7');
  out('yc7', { head: 5, tail: 2 });
  p('Kết quả gồm 13 nhóm (NSX, loại), trùng khớp với {B:thongke}.');
  h4('YC8 – Thống kê giá laptop theo NSX');
  p('Pipeline gồm bốn stage như {H:pipeline}: lọc laptop, nhóm theo maker và tính số lượng, giá trung bình, giá thấp nhất, cao nhất; làm tròn giá trung bình đến hai chữ số thập phân bằng `$round`; sắp xếp giảm dần theo giá trung bình. Lệnh và kết quả thực thi được thể hiện trong {H:yc8}.');
  cmd('yc8');
  term('yc8', 't2_yc8.png', 'Kết quả YC8 – thống kê giá laptop theo nhà sản xuất');
  p('G có giá trung bình cao nhất (2300 USD) nhưng chỉ có một laptop; trong các NSX có nhiều laptop, A cao nhất (1783,33 USD), E có biên độ giá rộng nhất (549 – 3673 USD), F thấp nhất (790 USD).');
  h4('YC9 – Thống kê theo loại sản phẩm');
  pk('Biểu thức `$cond` kết hợp `$ifNull` đếm số sản phẩm có thông tin giá trong từng loại; `$sum` và `$avg` tự động bỏ qua các document không có trường `price`:');
  cmd('yc9');
  out('yc9');
  p('Với `pc`, tổng giá bằng 0 và giá trung bình `null` do không có sản phẩm nào có giá – đúng với dữ liệu nguồn. Giá trung bình laptop (1583 USD) gấp khoảng 6,2 lần máy in (253,86 USD).');
  h4('YC10 – Dung lượng ổ cứng xuất hiện ở từ hai laptop trở lên');
  pk('Stage `$match` đặt **sau** `$group` đóng vai trò như mệnh đề HAVING trong SQL; kết quả gồm ba mức 80 GB (3 laptop), 60 GB và 120 GB (mỗi mức 2 laptop):');
  cmd('yc10');
  out('yc10');

  h3('2.2.3. Sắp xếp và kết hợp các stage trong Pipeline');
  h4('YC11 – Ba sản phẩm có giá cao nhất');
  pk('Kết hợp `$sort` giảm dần theo giá với `$limit: 3`; MongoDB tối ưu cặp stage này thành thuật toán top-k, chỉ giữ 3 phần tử trong bộ nhớ khi sắp xếp; ba sản phẩm đắt nhất đều là laptop:');
  cmd('yc11');
  out('yc11');
  h4('YC12 – Phân khúc laptop theo khoảng giá');
  pk('Stage `$bucket` phân nhóm theo các mốc `boundaries` [0, 1000), [1000, 2000), [2000, 5000); `_id` của mỗi nhóm là cận dưới của khoảng:');
  cmd('yc12');
  pk('Kết quả thực thi gồm 3 nhóm ({B:yc12}):');
  tbl('yc12', 'Kết quả YC12 – phân khúc laptop theo giá', ['_id (cận dưới)', 'Khoảng giá', 'soLaptop', 'dsModel', 'giaTB'], [
    ['0', '[0, 1000)', '4', '2002, 2003, 2008, 2009', '769.5'],
    ['1000', '[1000, 2000)', '3', '2004, 2006, 2007', '1426.33'],
    ['2000', '[2000, 5000)', '3', '2005, 2001, 2010', '2824.33'],
  ], [1.4, 1.5, 1, 2.6, 1.1], { align: ['c', 'c', 'c', 'c', 'c'] });
  p('Phân khúc dưới 1.000 USD có 4 laptop, hai phân khúc còn lại mỗi phân khúc 3 laptop – danh mục phân bố khá cân đối.');
  h4('YC13 – Phân tích danh mục loại sản phẩm của NSX');
  pk('(a) NSX bán laptop nhưng không bán PC: nhóm theo maker, gom tập các loại bằng `$addToSet`, sau đó lọc tập chứa “laptop” (`$all`) và không chứa “pc” (`$nin`):');
  cmd('yc13a');
  out('yc13a');
  pk('(b) NSX có từ hai loại sản phẩm trở lên – sử dụng `$size` để đếm số phần tử của tập loại và `$sortArray` để sắp xếp tập cho dễ đọc:');
  cmd('yc13b');
  out('yc13b');
  p('Truy vấn (a) tương ứng phép trừ tập hợp trong SQL (`SELECT maker FROM Product WHERE type = \'laptop\' EXCEPT SELECT maker FROM Product WHERE type = \'pc\'`) và cho kết quả F, G. Truy vấn (b) cho thấy E là NSX duy nhất có đủ ba loại; A, B, D có hai loại; C, F, G, H chỉ có một loại.');

  // ================= 2.3
  h2('2.3. Kết hợp và đánh giá kết quả khai thác dữ liệu');
  h3('2.3.1. Kết hợp các collection bằng $lookup');
  p('Stage `$lookup` thực hiện phép kết nối ngoài trái (left outer join) giữa collection đang xử lý và một collection khác trong cùng cơ sở dữ liệu. MongoDB hỗ trợ hai dạng: dạng so khớp đẳng thức (`localField`/`foreignField`) và dạng có pipeline con (`let`/`pipeline`) cho phép điều kiện kết nối và xử lý phức tạp hơn. Khi `localField` là mảng, mỗi phần tử của mảng được so khớp với `foreignField`.');
  h4('YC14 – Danh mục laptop của từng NSX (makers → products)');
  pk('Từ `makers`, kết nối với `products` qua `products.model` (mảng) và `model`; `$filter` chỉ giữ các sản phẩm là laptop; sau đó tính số laptop, danh sách model, giá trung bình và RAM lớn nhất:');
  p('Kết quả thực thi được thể hiện trong {H:yc14} (lược bớt hai document cuối của F và G). Số laptop và giá trung bình của từng NSX trùng khớp với kết quả YC8 được tính trực tiếp trên `products`, cho thấy mảng tham chiếu trong `makers` nhất quán với dữ liệu `products`.');
  term('yc14', 't2_yc14.png', 'Kết quả YC14 – kết hợp makers và products bằng $lookup');
  pk('Lệnh đầy đủ của pipeline YC14:');
  cmd('yc14');
  h4('YC15 – Quy mô danh mục của NSX cho từng máy in (products → makers)');
  pk('Chiều kết nối ngược lại: từ mỗi máy in trong `products`, tra cứu document NSX tương ứng trong `makers` qua `maker` = `_id`; `$unwind` chuyển mảng kết quả một phần tử thành document con:');
  cmd('yc15');
  p('Mỗi máy in được bổ sung tổng số sản phẩm của NSX: máy in của D nhận 5, của E nhận 9 (danh mục lớn nhất), của H nhận 2 – H chỉ chuyên về máy in.');
  h4('YC16 – Thống kê máy in theo NSX bằng $lookup có pipeline con');
  pk('Dạng `$lookup` với `let` và `pipeline` cho phép thực hiện lọc và nhóm ngay trong collection được kết nối. Biến `$$mk` mang giá trị `_id` của NSX đang xét; `$expr` dùng để so sánh trường với biến:');
  cmd('yc16');
  out('yc16');
  p('E có 3 máy in (2 máy in màu, giá thấp nhất 99 USD), H có 2 máy in màu, D có 2 máy in (1 máy in màu); tổng 7 máy in khớp dữ liệu nguồn.');

  h3('2.3.2. Phân tích và đánh giá kết quả theo yêu cầu nghiệp vụ');
  p('Toàn bộ 16 yêu cầu ở {B:yeucau} được thực hiện thành công. Về **tính đúng đắn**, mọi kết quả đều được đối chiếu với dữ liệu nguồn hoặc một truy vấn độc lập: YC1 – YC6, YC10, YC11 đối chiếu với {B:laptop}, {B:printer}; YC7 trùng {B:thongke}; YC8 trùng YC14; YC9 có tổng giá 15830 / 1777 bằng tổng cột price; YC12 có tổng 10 laptop; YC13 tương đương truy vấn SQL; YC16 có tổng 7 máy in – không phát hiện sai lệch.');
  bullets([
    '**Hiệu quả của mô hình nhúng:** 13/16 yêu cầu (YC1 – YC13) được trả lời chỉ trên `products`, không cần phép nối, nhờ cấu hình đã nhúng trong `specs` – minh chứng cho lựa chọn ở mục 1.2.3.',
    '**Vai trò của mô hình tham chiếu:** `$lookup` chỉ cần khi khai thác theo góc nhìn NSX (YC14 – YC16); mảng tham chiếu trong `makers` cho phép kết nối nhiều phần tử trong một stage.',
    '**Khả năng của Aggregation Pipeline:** biểu diễn được các phép tương đương WHERE, GROUP BY, HAVING, ORDER BY, CASE, EXCEPT, JOIN của SQL. Với dữ liệu lớn cần bổ sung chỉ mục (`type`, `price`, `specs.ram`) và đặt `$match` ở đầu pipeline.',
  ]);

  h2('Kết luận Chương 2');
  p('Chương 2 đã hiện thực thành công 16 yêu cầu khai thác theo nghiệp vụ bằng `find`, `distinct`, Aggregation Pipeline (`$match`, `$project`, `$group`, `$sort`, `$limit`, `$bucket`) và `$lookup` ở cả hai dạng. Kết quả được đối chiếu chéo, trùng khớp với dữ liệu nguồn và khẳng định tính phù hợp của mô hình dữ liệu đã chọn – làm cơ sở để triển khai trên môi trường phân tán ở Chương 3.');
}

module.exports = { chuong2 };
