// Chương 3 (Hướng 2), Kết luận, Tài liệu tham khảo
const L = require('./lib');
const { D, h1, h2, h3, h4, p, pk, bullets, code, cmd, out, fig, term, tbl, setChapter, step, push, runs } = L;
const { Paragraph, TextRun } = D;

function md5(id, coll) {
  const o = step(id).output;
  const m = o.match(new RegExp(coll + ": '([0-9a-f]+)'"));
  return m ? m[1] : (o.match(/^([0-9a-f]{32})$/) || [])[1];
}
function shortHash(h) { return h; }

function chuong3() {
  setChapter(3);
  h1('CHƯƠNG 3. TRIỂN KHAI CƠ SỞ DỮ LIỆU PHÂN TÁN TRONG MONGODB');
  p('Chương 3 triển khai cơ sở dữ liệu `QLThietBi` trên môi trường phân tán theo hướng 2 của đề tài. Phần đầu chương trình bày cơ chế sao chép dữ liệu bằng Replica Set: cấu hình cụm ba nút, kiểm tra vai trò Primary/Secondary, sự đồng bộ dữ liệu và khả năng chuyển đổi dự phòng khi nút Primary gặp sự cố. Phần tiếp theo phân tích phương án phân bố dữ liệu, lựa chọn khóa phân mảnh và xây dựng Sharded Cluster gồm hai shard. Cuối chương kiểm tra sự sao chép trong từng shard, sự phân bố dữ liệu trên các shard và đánh giá kết quả quản trị dữ liệu.');

  // ================= 3.1
  h2('3.1. Xây dựng và kiểm tra Replica Set');
  h3('3.1.1. Cấu hình Replica Set');
  p('**Replica Set** là một nhóm các tiến trình `mongod` cùng duy trì một tập dữ liệu, cung cấp khả năng dự phòng (redundancy) và tính sẵn sàng cao (high availability) [4], [7]. Trong một Replica Set, tại mỗi thời điểm chỉ có một nút **Primary** nhận toàn bộ thao tác ghi; mọi thay đổi được ghi vào **oplog** – một capped collection `local.oplog.rs` lưu nhật ký các thao tác theo dạng lũy đẳng. Các nút **Secondary** liên tục đọc oplog từ nguồn đồng bộ (thường là Primary) và áp dụng lại các thao tác, nhờ đó duy trì bản sao dữ liệu giống Primary.');
  p('Các nút trao đổi tín hiệu heartbeat với nhau mỗi 2 giây. Nếu Primary không phản hồi quá thời gian `electionTimeoutMillis` (mặc định 10 giây), các nút còn lại tổ chức bầu chọn; nút nhận được đa số phiếu (quá bán số thành viên có quyền bầu) trở thành Primary mới. Thuộc tính `priority` cho phép ưu tiên một nút làm Primary: khi nút có priority cao hơn trở lại và đã bắt kịp dữ liệu, nó sẽ yêu cầu bầu chọn để giành lại vai trò Primary. Ứng dụng điều chỉnh mức độ bảo đảm khi ghi bằng **write concern** (ví dụ `w: 1`, `w: "majority"`, `w: 3`) và nơi đọc dữ liệu bằng **read preference** (`primary`, `secondary`, `nearest`, …).');
  p('Replica Set `rs0` của tiểu luận gồm ba nút `mongo1`, `mongo2`, `mongo3` (cổng 27017) chạy trong ba container Docker trên cùng mạng `mongo-net` ({H:rs}); mỗi nút có một phiếu bầu, nút `mongo1` được đặt priority 2 để là Primary ưu tiên.');
  fig('rs', 'h3_1_replica_set.png', 'Kiến trúc Replica Set rs0 gồm ba nút', 'native');
  pk('Mỗi nút được khởi động với tham số `--replSet rs0`. Trích đoạn tệp `docker-compose.yml` khai báo nút `mongo1` (hai nút còn lại tương tự):');
  code(`services:
  mongo1:
    image: mongo:8.0
    container_name: mongo1
    hostname: mongo1
    networks: [mongo-net]
    command: mongod --replSet rs0 --bind_ip_all --port 27017
                    --wiredTigerCacheSizeGB 0.25`);
  pk('Sau khi các container khởi động, kết nối mongosh tới `mongo1` và khởi tạo Replica Set bằng `rs.initiate()` với cấu hình ba thành viên:');
  cmd('rs_initiate');
  out('rs_initiate', { keep: [[0, 2], [10, 11]] });
  p('Kết quả `ok: 1` cho biết Replica Set đã được khởi tạo; lệnh `rs.conf()` xác nhận ba thành viên với priority lần lượt 2, 1, 1 và mỗi thành viên một phiếu bầu.');

  h3('3.1.2. Kiểm tra Primary, Secondary và sao chép dữ liệu');
  h4('a) Trạng thái các nút');
  p('Lệnh `rs.status()` cho biết trạng thái của từng thành viên ({H:rsstatus}): `mongo1` là PRIMARY, `mongo2` và `mongo3` là SECONDARY với nguồn đồng bộ `syncSourceHost: mongo1:27017`; cả ba nút đều khỏe (`health: 1`) và có cùng thời điểm thao tác cuối (`optimeDate`), tức là các Secondary đã bắt kịp Primary.');
  term('rsstatus', 't3_rs_status.png', 'Trạng thái các thành viên của Replica Set rs0');
  h4('b) Ghi dữ liệu tại Primary và theo dõi oplog');
  pk('Để kiểm tra cơ chế sao chép mà không tác động tới dữ liệu nguồn, một collection tạm `kiemtra_saochep` được sử dụng (sẽ bị xóa sau khi kiểm tra). Ghi một document với write concern `w: 3` – thao tác chỉ được xác nhận khi cả ba nút đã ghi nhận:');
  cmd('write_majority');
  out('write_majority', { prefix: [] });
  pk('Thao tác ghi được lưu trong oplog của Primary dưới dạng một bản ghi `op: "i"` (insert) kèm nội dung document và dấu thời gian `ts`:');
  cmd('oplog_entry');
  out('oplog_entry', { keep: [[0, 4], [6, 7], [8, 12]] });
  pk('Độ trễ sao chép của các Secondary so với Primary:');
  cmd('repl_lag');
  out('repl_lag', { keep: [[0, 1], [3, 4], [6, 7], [9, 10]] });
  p('Cả hai Secondary đều có độ trễ 0 giây, đồng bộ tới cùng thời điểm với Primary.');
  h4('c) Đọc dữ liệu tại Secondary');
  p('Kết nối trực tiếp tới `mongo2` ({H:secondary}): nút này xác nhận vai trò Secondary (`isWritablePrimary: false`); số document của `products` (30) và `makers` (8) giống hệt Primary; document vừa ghi tại Primary đã có mặt. Thao tác ghi trực tiếp vào Secondary bị từ chối với lỗi `NotWritablePrimary` – bảo đảm mọi thao tác ghi chỉ đi qua Primary.');
  term('secondary', 't3_secondary.png', 'Đọc dữ liệu và thử ghi tại nút Secondary mongo2');
  h4('d) Kiểm tra sự đồng bộ bằng giá trị băm dữ liệu');
  p('Để kiểm chứng chặt chẽ rằng dữ liệu trên các nút **giống hệt nhau**, lệnh `dbHash` được thực hiện trên từng nút; lệnh này tính giá trị băm MD5 trên toàn bộ nội dung của từng collection:');
  cmd('dbhash_mongo1');
  tbl('dbhash', 'Giá trị băm dữ liệu (dbHash) trên các nút của rs0', ['Nút', 'Vai trò', 'products', 'makers'], [
    ['mongo1', 'Primary', md5('dbhash_mongo1', 'products'), md5('dbhash_mongo1', 'makers')],
    ['mongo2', 'Secondary', md5('dbhash_mongo2', 'products'), md5('dbhash_mongo2', 'makers')],
    ['mongo3', 'Secondary', md5('dbhash_mongo3', 'products'), md5('dbhash_mongo3', 'makers')],
  ], [1.1, 1.3, 3.6, 3.6], { align: ['c', 'c', 'c', 'c'], mono: [false, false, true, true] });
  p('Giá trị băm của cả hai collection trên ba nút trùng nhau hoàn toàn ({B:dbhash}), khẳng định dữ liệu đã được sao chép đầy đủ và nhất quán.');
  h4('e) Kiểm thử chuyển đổi dự phòng (failover)');
  p('Kịch bản kiểm thử mô phỏng sự cố nút Primary gồm hai giai đoạn: (b) dừng đột ngột container `mongo1` để các nút còn lại bầu Primary mới; (c) khởi động lại `mongo1` để nút này bắt kịp dữ liệu và giành lại vai trò Primary nhờ priority cao hơn. Kết quả giai đoạn (b) được thể hiện trong {H:failover1}: sau khi dừng `mongo1`, `rs.status()` (kết nối qua chuỗi kết nối Replica Set tới `mongo2`, `mongo3`) cho thấy `mongo1` ở trạng thái “not reachable/healthy”, `mongo2` đã được bầu làm PRIMARY. Hệ thống vẫn tiếp nhận thao tác ghi với write concern `majority` (2/3 nút) – dịch vụ không bị gián đoạn.');
  term('failover1', 't3_failover.png', 'Dừng nút Primary mongo1 – Replica Set bầu mongo2 làm Primary mới');
  p('Giai đoạn (c) – {H:failover2}: sau khi khởi động lại, `mongo1` tự động đồng bộ các thao tác đã diễn ra trong thời gian dừng (document “Ghi trong lúc mongo1 dừng” đã có mặt) và trở lại vai trò PRIMARY; `mongo2` trở về SECONDARY.');
  term('failover2', 't3_recover.png', 'Khởi động lại mongo1 – nút tự đồng bộ và giành lại vai trò Primary');
  pk('Sau kiểm thử, collection tạm được xóa; giá trị băm toàn cơ sở dữ liệu `QLThietBi` được so sánh lại trên ba nút:');
  cmd('recover_cleanup');
  cmd('dbhash_final_mongo1');
  out('dbhash_final_mongo1', { prefix: ['// mongo1'] });
  out('dbhash_final_mongo2', { prefix: ['// mongo2'] });
  out('dbhash_final_mongo3', { prefix: ['// mongo3'] });
  p('Ba nút có cùng giá trị băm, đồng thời trên `mongo2` chỉ còn hai collection `products` và `makers` – Replica Set đã trở về trạng thái ban đầu, dữ liệu nguồn không bị ảnh hưởng bởi quá trình kiểm thử.');

  // ================= 3.2
  h2('3.2. Xây dựng Sharded Cluster');
  p('**Sharding** là phương pháp phân bố dữ liệu trên nhiều máy chủ để mở rộng theo chiều ngang. Một Sharded Cluster của MongoDB gồm ba thành phần [7]: (1) **shard** – mỗi shard lưu một tập con dữ liệu và được triển khai dưới dạng Replica Set; (2) **mongos** – bộ định tuyến nhận truy vấn từ ứng dụng và chuyển tới các shard liên quan; (3) **config server** – Replica Set lưu siêu dữ liệu của cụm (danh sách shard, phân bố chunk, zone). Dữ liệu của collection được phân mảnh theo **shard key**; mỗi **chunk** là một khoảng liên tục các giá trị shard key, được gán cho một shard. Tiến trình **balancer** di chuyển chunk giữa các shard để cân bằng dữ liệu và bảo đảm ràng buộc **zone**. Kiến trúc cụm được triển khai trong tiểu luận được thể hiện trong {H:sharded}.');
  fig('sharded', 'h3_3_sharded.png', 'Kiến trúc Sharded Cluster được triển khai', 'native');
  h3('3.2.1. Phân tích và lựa chọn Shard Key');
  p('Shard key quyết định hiệu quả của toàn bộ cụm và rất khó thay đổi về sau, vì vậy cần được lựa chọn dựa trên các tiêu chí [4], [7]:');
  bullets([
    '**Lực lượng (cardinality):** số giá trị phân biệt của khóa – quyết định số chunk tối đa có thể tạo ra.',
    '**Tần suất (frequency):** mức độ lặp lại của các giá trị – giá trị xuất hiện quá nhiều dễ tạo chunk quá lớn (jumbo chunk) không thể chia nhỏ.',
    '**Tính đơn điệu (monotonicity):** khóa tăng dần theo thời gian khiến mọi thao tác chèn dồn vào chunk cuối cùng (điểm nóng ghi).',
    '**Khả năng định tuyến truy vấn (query isolation):** truy vấn có chứa shard key được mongos chuyển tới đúng shard (targeted query); ngược lại phải gửi tới mọi shard (scatter-gather).',
  ]);
  p('Áp dụng các tiêu chí cho collection `products` với mẫu truy cập ở {B:truycap}, năm phương án khóa ứng viên được phân tích trong {B:shardkey}.');
  tbl('shardkey', 'Phân tích các phương án shard key cho collection products', ['Ứng viên', 'Lực lượng', 'Tần suất / tính đơn điệu', 'Định tuyến truy vấn', 'Đánh giá'], [
    ['{ type: 1 }', '3', 'Lệch: pc chiếm 13/30', 'Tốt cho lọc theo loại (TC3)', 'Loại: tối đa 3 chunk'],
    ['{ maker: 1 }', '8', 'Lệch: E chiếm 9/30', 'Tốt cho theo NSX (TC2, TC5)', 'Hạn chế: không chia nhỏ được dữ liệu của một NSX'],
    ['{ model: 1 }', '30 (duy nhất)', 'Model mới tăng dần → điểm nóng ghi', 'Chỉ tốt cho tra cứu theo model (TC1)', 'Loại'],
    ['{ model: "hashed" }', '30 (duy nhất)', 'Phân bố đều, không đơn điệu', 'Truy vấn theo NSX, khoảng giá trị phải gửi mọi shard', 'Phương án so sánh'],
    ['{ maker: 1, model: 1 }', '30 (duy nhất)', 'Đều ở mức khóa ghép; model mới phân tán theo NSX', 'Định tuyến được truy vấn theo maker và maker + model', 'Lựa chọn'],
  ], [2.2, 1.3, 2.3, 2.5, 1.9], { align: ['l', 'c', 'l', 'l', 'l'], mono: [true, false, false, false, false] });
  p('Tiểu luận lựa chọn **shard key ghép `{ maker: 1, model: 1 }` với phân mảnh theo khoảng (ranged sharding)**. Thành phần `maker` đứng đầu giúp mọi truy vấn theo NSX (TC2, TC5) và tra cứu theo cặp maker – model được định tuyến tới một shard duy nhất, đồng thời giữ các sản phẩm của cùng NSX nằm gần nhau (data locality). Thành phần `model` bổ sung bảo đảm khóa có lực lượng bằng số document, cho phép chia nhỏ chunk ngay cả trong phạm vi một NSX khi dữ liệu tăng trưởng – khắc phục hạn chế của khóa `{ maker: 1 }` đơn lẻ.');
  p('Về mặt lý thuyết CSDL phân tán, phương án tương ứng với **phân mảnh ngang nguyên thủy** quan hệ `products` theo các vị từ đơn giản trên thuộc tính maker [5]:');
  code(`F1 = σ(maker < 'E')(products)    → cấp phát cho shard1rs   (zone NSX_A_D)
F2 = σ(maker ≥ 'E')(products)    → cấp phát cho shard2rs   (zone NSX_E_H)`);
  p('Cách phân mảnh thỏa mãn ba tính chất đúng đắn: **đầy đủ** (mỗi document thuộc một mảnh vì maker luôn có giá trị), **tái thiết được** (products = F1 ∪ F2) và **rời nhau** (F1 ∩ F2 = ∅). Theo {B:thongke}, mảnh F1 (NSX A, B, C, D) có 16 document, mảnh F2 (NSX E, F, G, H) có 14 document – tỷ lệ 53% / 47%, khá cân bằng.');
  p('Do tổng dung lượng dữ liệu chỉ khoảng 3 KB, nhỏ hơn rất nhiều kích thước chunk mặc định 128 MB, balancer sẽ không tự chia và di chuyển chunk. Vì vậy, việc cấp phát các mảnh cho shard được khai báo tường minh bằng **zone sharding**: mỗi shard được gán một zone, mỗi zone ứng với một khoảng giá trị shard key. Khi dữ liệu tăng, các chunk trong một zone vẫn được tự động chia nhỏ và cân bằng giữa các shard thuộc cùng zone.');
  p('Collection `makers` chỉ có 8 document nhỏ nên **không phân mảnh**; nó được lưu trên shard chính (primary shard) của cơ sở dữ liệu là `shard1rs`. Stage `$lookup` giữa `makers` và collection đã phân mảnh `products` vẫn được hỗ trợ. Cần lưu ý rằng trên collection đã phân mảnh, chỉ mục duy nhất phải có tiền tố là shard key, vì vậy ràng buộc duy nhất được khai báo trên `{ maker: 1, model: 1 }`.');

  h3('3.2.2. Cấu hình và thực hiện Sharding');
  p('Các thành phần của Sharded Cluster ({H:sharded}) được liệt kê trong {B:cluster}. Mỗi shard là một Replica Set ba nút, do đó cụm vừa phân mảnh vừa sao chép dữ liệu.');
  tbl('cluster', 'Các thành phần của Sharded Cluster', ['Thành phần', 'Replica Set', 'Container (cổng)', 'Vai trò'], [
    ['Config Server', 'cfgrs', 'cfgsvr1, cfgsvr2, cfgsvr3 (27019)', 'Lưu metadata: shard, chunk, zone'],
    ['Shard 1', 'shard1rs', 'shard1a, shard1b, shard1c (27018)', 'Lưu mảnh F1 (NSX A – D) và makers'],
    ['Shard 2', 'shard2rs', 'shard2a, shard2b, shard2c (27018)', 'Lưu mảnh F2 (NSX E – H)'],
    ['Router', '–', 'mongos (27017)', 'Định tuyến truy vấn của ứng dụng'],
  ], [1.6, 1.3, 3.2, 2.7], { align: ['l', 'c', 'l', 'l'] });
  h4('Bước 1: Khởi tạo Config Server Replica Set');
  pk('Các nút config server được khởi động với tham số `--configsvr --replSet cfgrs`; Replica Set được khởi tạo với thuộc tính `configsvr: true`:');
  cmd('cfg_initiate');
  h4('Bước 2: Khởi tạo các shard Replica Set');
  pk('Các nút shard được khởi động với tham số `--shardsvr`. Khởi tạo `shard1rs` (tương tự với `shard2rs` gồm shard2a, shard2b, shard2c):');
  cmd('shard1_initiate');
  h4('Bước 3: Thêm shard vào cụm qua mongos');
  pk('Bộ định tuyến `mongos` được khởi động với tham số `--configdb cfgrs/cfgsvr1:27019,cfgsvr2:27019,cfgsvr3:27019`. Kết nối tới mongos và thêm hai shard:');
  cmd('add_shard1');
  out('add_shard1', { keep: [[0, 3], [11, 12]] });
  cmd('add_shard2');
  cmd('list_shards');
  out('list_shards');
  h4('Bước 4: Bật sharding cho cơ sở dữ liệu và tạo collection');
  pk('Bật sharding cho `QLThietBi` với shard chính `shard1rs`; collection `products` sau đó được tạo bằng `db.createCollection` với cùng bộ kiểm tra `$jsonSchema` như mục 1.4.1:');
  cmd('enable_sharding');
  h4('Bước 5: Định nghĩa zone và khoảng giá trị shard key');
  pk('Gán mỗi shard vào một zone và khai báo khoảng shard key cho từng zone; `MinKey`, `MaxKey` biểu diễn giá trị nhỏ nhất, lớn nhất. Khoảng có cận dưới đóng, cận trên mở:');
  cmd('zone_add');
  cmd('zone_range1');
  cmd('zone_range2');
  h4('Bước 6: Tạo chỉ mục shard key và phân mảnh collection');
  pk('Tạo chỉ mục duy nhất trên shard key, sau đó phân mảnh collection với tham số `unique: true`. Vì zone đã được định nghĩa trước khi phân mảnh collection rỗng, MongoDB tạo sẵn các chunk theo zone và đặt chúng lên đúng shard:');
  cmd('shard_index');
  cmd('shard_collection');
  out('shard_collection', { keep: [[0, 3], [11, 12]] });
  h4('Bước 7: Nhập dữ liệu qua mongos');
  p('Dữ liệu được nhập qua `mongos` bằng đúng lệnh `insertMany` 30 document ở mục 1.4.1; mongos tự định tuyến từng document tới shard theo giá trị shard key. Collection `makers` được sinh bằng pipeline `$out` như Bước 4 mục 1.4.1. Kiểm tra số lượng và tổng giá sau khi nhập:');
  cmd('counts');
  out('counts');
  cmd('verify_sum');
  out('verify_sum');
  p('Số lượng (30 sản phẩm, 8 NSX) và tổng giá theo loại (15830, 1777) trùng khớp với dữ liệu nguồn và với kết quả trên Replica Set `rs0`.');

  // ================= 3.3
  h2('3.3. Đánh giá kết quả triển khai');
  h3('3.3.1. Kiểm tra sao chép dữ liệu');
  p('Trong Sharded Cluster, mỗi shard là một Replica Set nên dữ liệu của mỗi mảnh được sao chép trên ba nút. Kết nối trực tiếp tới từng nút của hai shard, đếm số document bằng `countDocuments()` và tính giá trị băm bằng lệnh `dbHash` như mục 3.1.2; kết quả được tổng hợp trong {B:shardrepl}.');
  tbl('shardrepl', 'Kết quả kiểm tra sao chép dữ liệu trên các nút của hai shard', ['Nút', 'Vai trò', 'products', 'makers', 'md5 products'], [
    ['shard1a', 'Primary', '16', '8', md5('s1a_hash', 'products')],
    ['shard1b', 'Secondary', '16', '8', md5('s1b_hash', 'products')],
    ['shard1c', 'Secondary', '16', '8', md5('s1c_hash', 'products')],
    ['shard2a', 'Primary', '14', '–', md5('s2a_hash', 'products')],
    ['shard2b', 'Secondary', '14', '–', md5('s2b_hash', 'products')],
    ['shard2c', 'Secondary', '14', '–', md5('s2c_hash', 'products')],
  ], [1.2, 1.3, 1.1, 1.0, 4.2], { align: ['c', 'c', 'c', 'c', 'c'], mono: [false, false, false, false, true] });
  p('Ba nút của `shard1rs` cùng lưu 16 sản phẩm và 8 NSX với cùng giá trị băm; ba nút của `shard2rs` cùng lưu 14 sản phẩm với cùng giá trị băm. Giá trị băm của `makers` trên shard1rs (`' + md5('s1a_hash', 'makers') + '`) trùng với giá trị trên Replica Set `rs0` ở {B:dbhash} – dữ liệu NSX ở hai môi trường giống hệt nhau.');
  h4('Kiểm thử sự cố nút Primary trong một shard');
  p('Để đánh giá tính sẵn sàng của cụm, container `shard1a` (Primary của `shard1rs`) bị dừng đột ngột. Kết quả ({H:shardha}) cho thấy: truy vấn qua mongos vẫn trả về đủ 30 sản phẩm và 6 sản phẩm của NSX A (dữ liệu thuộc shard1rs); thao tác cập nhật vào dữ liệu của shard1rs vẫn thành công; `shard1b` đã được bầu làm Primary mới của `shard1rs`.');
  term('shardha', 't3_shard_ha.png', 'Dừng nút Primary shard1a – cụm vẫn phục vụ đọc, ghi qua mongos');
  pk('Trạng thái của `shard1rs` khi `shard1a` dừng (kết nối tới `shard1b`):');
  cmd('ha_rs_status');
  out('ha_rs_status');
  p('Giá trị cập nhật thử nghiệm (price = 1199) được kiểm tra qua mongos rồi hoàn tác về giá gốc 1150 khi `shard1a` vẫn đang dừng.');
  pk('Khởi động lại `shard1a` (`docker start shard1a`), kiểm tra trạng thái và dữ liệu trên chính nút này:');
  cmd('ha_rs_status2');
  out('ha_rs_status2');
  cmd('ha_s1a_count');
  out('ha_s1a_count');
  p('`shard1a` đã trở lại vai trò Primary và có giá trị price = 1150, tức là nút đã áp dụng đầy đủ hai thao tác cập nhật diễn ra trong thời gian nó dừng. Cơ chế sao chép bên trong từng shard bảo đảm Sharded Cluster không có điểm lỗi đơn ở tầng lưu trữ dữ liệu.');

  h3('3.3.2. Kiểm tra phân bố dữ liệu trên các Shard');
  h4('a) Phân bố document và chunk');
  p('Phương thức `getShardDistribution()` thống kê dữ liệu của collection trên từng shard ({H:sharddist}): `shard1rs` lưu 16 document (53,33%), `shard2rs` lưu 14 document (46,66%), mỗi shard một chunk.');
  term('sharddist', 't3_shard_dist.png', 'Kết quả getShardDistribution() của collection products');
  pk('Stage `$shardedDataDistribution` cho biết thêm số document mồ côi (orphaned) – document nằm trên shard nhưng không thuộc chunk của shard đó:');
  cmd('sharded_data_distribution');
  out('sharded_data_distribution', { keep: [[0, 5], [7, 12], [14, 16]] });
  p('Truy vấn collection `config.chunks` trên config server cho thấy hai chunk có biên trùng khớp với hai zone đã khai báo: chunk [{maker: MinKey}, {maker: "E"}) trên shard1rs và chunk [{maker: "E"}, {maker: MaxKey}] trên shard2rs; số document mồ côi bằng 0. Phân bố chi tiết theo NSX được trực quan hóa trong {H:distchart}.');
  fig('distchart', 'h3_4_distribution.png', 'Phân bố document của collection products theo nhà sản xuất trên hai shard', 'native');
  h4('b) Kiểm tra định tuyến truy vấn');
  p('Phương thức `explain()` cho biết kế hoạch thực thi mà mongos lựa chọn. {H:explain} và {B:explain} cho thấy: truy vấn có điều kiện trên tiền tố shard key (`maker`) được định tuyến tới **một shard duy nhất** (`SINGLE_SHARD`); truy vấn không chứa shard key (`type`, hoặc chỉ `model`) phải gửi tới **mọi shard** rồi hợp nhất kết quả (`SHARD_MERGE`).');
  term('explain', 't3_explain.png', 'Kế hoạch thực thi của truy vấn có và không có shard key');
  const ex = id => { const o = step(id).output; return { stage: (o.match(/stage: '(\w+)'/) || [])[1], n: (o.match(/nReturned: (\d+)/) || [])[1] }; };
  tbl('explain', 'Kết quả định tuyến truy vấn trên Sharded Cluster', ['Truy vấn', 'Kế hoạch', 'Shard tham gia', 'Số kết quả'], [
    ['{ maker: "A" }', ex('explain_maker_A').stage, 'shard1rs', ex('explain_maker_A').n],
    ['{ maker: "E", model: 2001 }', ex('explain_maker_model').stage, 'shard2rs', ex('explain_maker_model').n],
    ['{ maker: { $in: ["F", "G", "H"] } }', ex('explain_range').stage, 'shard2rs', ex('explain_range').n],
    ['{ type: "laptop" }', ex('explain_type').stage, 'shard1rs (4), shard2rs (6)', ex('explain_type').n],
    ['{ model: 2001 }', ex('explain_model_only').stage, 'shard1rs, shard2rs', ex('explain_model_only').n],
  ], [3.3, 1.9, 2.5, 1.1], { align: ['l', 'c', 'c', 'c'], mono: [true, true, false, false] });
  p('Truy vấn tổng hợp đếm sản phẩm theo NSX qua mongos được thực hiện song song trên hai shard, hợp nhất tại mongos và cho kết quả trùng với {B:thongke}.');
  h4('c) So sánh với phương án khóa băm');
  p('Để đối chiếu, một bản sao của dữ liệu được nạp vào collection thử nghiệm `products_hashed` phân mảnh theo khóa băm `{ model: "hashed" }`, sau đó kiểm tra phân bố bằng `$shardedDataDistribution` và kế hoạch thực thi bằng `explain()` như các mục trên (collection được xóa sau khi so sánh). Kết quả so sánh được tổng hợp trong {B:sosanhkhoa}.');
  cmd('hashed_shard');
  cmd('hashed_copy');
  tbl('sosanhkhoa', 'So sánh hai phương án shard key qua thực nghiệm', ['Tiêu chí', '{ maker: 1, model: 1 } + zone', '{ model: "hashed" }'], [
    ['Phân bố document (shard1rs / shard2rs)', '16 / 14', '14 / 16'],
    ['Kiểm soát vị trí dữ liệu', 'Tường minh theo NSX (zone)', 'Ngẫu nhiên theo giá trị băm'],
    ['Truy vấn { maker: "A" }', 'SINGLE_SHARD', (step('hashed_explain_maker').output.match(/stage: '(\w+)'/) || [])[1] + ' (2 shard)'],
    ['Truy vấn { model: 2001 }', 'SHARD_MERGE (2 shard)', (step('hashed_explain_model').output.match(/stage: '(\w+)'/) || [])[1]],
    ['Truy vấn khoảng theo NSX', 'Định tuyến được', 'Phải gửi mọi shard'],
    ['Phân tán ghi khi thêm model mới', 'Theo NSX của sản phẩm', 'Đều trên các shard'],
  ], [3.2, 2.9, 2.6], { align: ['l', 'c', 'c'] });
  p('Cả hai phương án đều phân bố dữ liệu tương đối cân bằng. Khóa băm phân tán ghi đều nhưng mọi truy vấn theo NSX phải gửi tới tất cả shard; với mẫu truy cập của bài toán (TC2, TC5 thường xuyên), khóa ghép `{ maker: 1, model: 1 }` kết hợp zone là lựa chọn phù hợp hơn.');
  h4('d) Đánh giá tổng hợp');
  tbl('danhgia', 'Đánh giá kết quả quản trị dữ liệu trên MongoDB', ['Tiêu chí', 'Kết quả', 'Minh chứng'], [
    ['Toàn vẹn dữ liệu', '30 sản phẩm, 8 NSX; tổng giá 15830 / 1777 trên cả hai môi trường', 'verify_restore, verify_sum'],
    ['Đồng bộ giữa các nút', 'Giá trị băm trùng nhau trên mọi nút của rs0, shard1rs, shard2rs', `${'{B:dbhash}'}, ${'{B:shardrepl}'}`],
    ['Tính sẵn sàng', 'Tự bầu Primary mới khi Primary dừng; đọc ghi không gián đoạn; nút phục hồi tự bắt kịp', `${'{H:failover1}'}, ${'{H:shardha}'}`],
    ['Phân bố dữ liệu', '16 / 14 document đúng theo zone; 0 document mồ côi', `${'{H:sharddist}'}`],
    ['Định tuyến truy vấn', 'Truy vấn theo maker đến 1 shard; truy vấn khác hợp nhất từ 2 shard', `${'{B:explain}'}`],
  ], [2.0, 4.4, 2.4], { align: ['l', 'l', 'l'] });

  h2('Kết luận Chương 3');
  p('Chương 3 đã triển khai thành công `QLThietBi` trên môi trường phân tán. Replica Set `rs0` ba nút sao chép dữ liệu qua oplog với độ trễ 0 giây, giá trị băm trên ba nút trùng khớp; khi Primary gặp sự cố, cụm tự bầu Primary mới và nút phục hồi tự bắt kịp dữ liệu. Khóa phân mảnh `{ maker: 1, model: 1 }` kết hợp zone theo NSX được lựa chọn qua phân tích lực lượng, tần suất, tính đơn điệu và khả năng định tuyến, tương ứng phân mảnh ngang nguyên thủy theo maker. Sharded Cluster phân bố dữ liệu đúng thiết kế (16 / 14 document), định tuyến truy vấn theo NSX tới một shard và vẫn phục vụ khi một nút trong shard gặp sự cố.');
}

function ketLuan() {
  setChapter(4);
  h1('KẾT LUẬN');
  h2('Kết quả đạt được');
  p('Tiểu luận đã hoàn thành các mục tiêu nghiên cứu đề ra đối với bài toán xây dựng và quản trị cơ sở dữ liệu quản lý thiết bị máy tính trên MongoDB:');
  bullets([
    'Phân tích bài toán, dữ liệu nguồn và các mẫu truy cập; lựa chọn mô hình kết hợp gồm `products` nhúng cấu hình vào `specs` và `makers` lưu mảng tham chiếu, có ràng buộc `$jsonSchema` và chỉ mục duy nhất.',
    'Nhập đầy đủ, chính xác 30 sản phẩm theo dữ liệu nguồn; thực hiện tạo lập, tìm kiếm, cập nhật (có hoàn tác) trên document, embedded document và mảng; hiện thực 16 yêu cầu khai thác bằng `find`, Aggregation Pipeline và `$lookup` với kết quả được đối chiếu chéo.',
    'Cấu hình Replica Set ba nút, kiểm chứng đồng bộ (oplog, độ trễ, giá trị băm) và chuyển đổi dự phòng; lựa chọn shard key, xây dựng Sharded Cluster hai shard với zone theo NSX, kiểm tra phân bố và định tuyến truy vấn, so sánh với phương án khóa băm.',
  ]);
  p('Kết quả cho thấy MongoDB phù hợp với dữ liệu danh mục sản phẩm không đồng nhất: mô hình document biểu diễn tự nhiên các loại sản phẩm, Aggregation Pipeline đáp ứng tốt yêu cầu thống kê, Replica Set và Sharding cung cấp tính sẵn sàng và khả năng mở rộng mà không cần thay đổi ứng dụng.');
  h2('Hạn chế');
  bullets([
    'Dữ liệu nhỏ (30 sản phẩm, khoảng 3 KB) nên chưa đánh giá được hiệu năng, quá trình tự chia chunk và hoạt động của balancer ở quy mô lớn.',
    'Toàn bộ 13 tiến trình máy chủ chạy trên một máy tính bằng Docker, chưa phản ánh độ trễ mạng và sự cố phần cứng thực tế; môi trường chưa bật xác thực, phân quyền và mã hóa TLS.',
  ]);
  h2('Hướng phát triển');
  bullets([
    'Sinh dữ liệu mô phỏng quy mô lớn để đánh giá hiệu năng, quan sát chia chunk, cân bằng dữ liệu; triển khai cụm trên nhiều máy chủ hoặc MongoDB Atlas với cơ chế bảo mật và giám sát.',
    'Tối ưu truy vấn bằng chỉ mục; dùng giao tác đa tài liệu để đồng bộ `products` – `makers` khi bổ sung sản phẩm (trên collection phân mảnh, tính duy nhất của model hiện dựa vào chỉ mục ghép `{ maker, model }`).',
  ]);
}

function taiLieu() {
  h1('TÀI LIỆU THAM KHẢO');
  const ref = (n, parts) => push(new Paragraph({ style: 'Ref', children: [new TextRun('[' + n + ']. '), ...parts] }));
  const T = t => new TextRun(t), I = t => new TextRun({ text: t, italics: true });
  push(new Paragraph({ style: 'Body', indent: { firstLine: 0 }, children: [new TextRun({ text: 'Tài liệu tiếng Việt', bold: true })] }));
  ref(1, [T('Sở Bưu chính Viễn thông thành phố Hà Nội (2005), '), I('Giáo trình Cơ sở dữ liệu'), T(', Sở Bưu chính Viễn thông thành phố Hà Nội, Hà Nội.')]);
  ref(2, [I('Oracle cơ bản – SQL và PL/SQL'), T(', Cơ sở dữ liệu thực hành.')]);
  push(new Paragraph({ style: 'Body', indent: { firstLine: 0 }, children: [new TextRun({ text: 'Tài liệu tiếng Anh', bold: true })] }));
  ref(3, [T('Chellappan, Subhashini and Ganesan, Dharanitharan (2020), '), I('MongoDB Recipes: With Data Modeling and Query Building Strategies'), T(', Apress, Berkeley, CA.')]);
  ref(4, [T('Chodorow, Kristina (2013), '), I('MongoDB: The Definitive Guide'), T(', 2nd edition, O’Reilly Media, Sebastopol, CA.')]);
  ref(5, [T('Elmasri, Ramez and Navathe, Shamkant B. (2016), '), I('Fundamentals of Database Systems'), T(', 7th edition, Pearson, Boston.')]);
  ref(6, [T('Garcia-Molina, Hector, Ullman, Jeffrey D. and Widom, Jennifer (2009), '), I('Database Systems: The Complete Book'), T(', Second Edition, Pearson Prentice Hall, Upper Saddle River, New Jersey.')]);
  ref(7, [T('MongoDB, Inc. (2025), '), I('MongoDB Manual – Version 8.0'), T(', MongoDB, Inc., New York. Truy cập tại: https://www.mongodb.com/docs/manual/.')]);
}

module.exports = { chuong3, ketLuan, taiLieu };
