# Môi trường thực nghiệm – Đề tài 5 (MongoDB: sao chép và phân mảnh)

Toàn bộ lệnh và kết quả trong báo cáo được sinh từ thư mục này.

| Thành phần | Container | Cổng |
|---|---|---|
| Replica Set `rs0` | mongo1 (Primary, priority 2), mongo2, mongo3 | 27017 |
| Config Server `cfgrs` | cfgsvr1, cfgsvr2, cfgsvr3 | 27019 |
| Shard 1 `shard1rs` | shard1a, shard1b, shard1c | 27018 |
| Shard 2 `shard2rs` | shard2a, shard2b, shard2c | 27018 |
| Router | mongos | 27017 (ra máy host: 27030) |

## Chạy lại toàn bộ

Yêu cầu: Docker Desktop, Python 3, Git Bash.

```bash
bash run_all.sh        # xóa cụm cũ, dựng lại 13 container, chạy lần lượt scripts/01 → 05
```

Kết quả từng lệnh được lưu trong `results/*.json` (dùng để dựng báo cáo) và `results/*.log`.

| Kịch bản | Nội dung | Mục trong báo cáo |
|---|---|---|
| `scripts/01_init_rs0.js` | Khởi tạo Replica Set rs0 | 3.1.1 |
| `scripts/02_chuong1.js` | Tạo collection, nhập dữ liệu, tìm kiếm, cập nhật (có hoàn tác) | 1.4 |
| `scripts/03_chuong2.js` | 16 yêu cầu truy vấn / Aggregation / `$lookup` | Chương 2 |
| `scripts/04_chuong3_replica.js` | Kiểm tra Primary/Secondary, oplog, dbHash, failover | 3.1.2 |
| `scripts/05_chuong3_sharding.js` | Sharded Cluster, zone, phân bố dữ liệu, explain, khóa băm | 3.2, 3.3 |

Kịch bản 04 dừng/khởi động lại container `mongo1`, kịch bản 05 dừng/khởi động lại `shard1a` để kiểm thử chuyển đổi dự phòng.

Kết nối thử bằng mongosh:

```bash
docker exec -it mongo1 mongosh "mongodb://mongo1:27017/QLThietBi?directConnection=true"
docker exec -it mongos mongosh "mongodb://mongos:27017/QLThietBi"
```

Dừng và xóa cụm: `docker compose down`.
