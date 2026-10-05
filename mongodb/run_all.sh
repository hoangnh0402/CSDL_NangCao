#!/usr/bin/env bash
# Dựng lại toàn bộ môi trường từ đầu và chạy tuần tự các kịch bản của báo cáo.
# Kết quả thực tế của từng lệnh được lưu trong thư mục results/.
set -e
cd "$(dirname "$0")"
docker compose down --remove-orphans
docker compose up -d
sleep 15
for f in scripts/01_init_rs0.js scripts/02_chuong1.js scripts/03_chuong2.js \
         scripts/04_chuong3_replica.js scripts/05_chuong3_sharding.js; do
  echo ">>> $f"
  python run_steps.py "$f" > "results/$(basename "$f" .js).log"
done
echo "Hoàn tất. Xem kết quả trong results/"
