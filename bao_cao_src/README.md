# Mã nguồn dựng quyển báo cáo

Sinh file `BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang.docx` từ kết quả thực nghiệm trong `../mongodb/results/`.

```bash
npm install                       # cài thư viện docx
python diagrams.py                # vẽ sơ đồ, biểu đồ -> figs/
python render_terms.py            # dựng ảnh cửa sổ mongosh từ kết quả thật -> figs/
node build_report.js ../BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang.docx
powershell -ExecutionPolicy Bypass -File word_update.ps1 -Docx "D:\CSDL_NangCao\BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang.docx" -Pdf "D:\CSDL_NangCao\BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang.pdf"
```

Bước cuối dùng Microsoft Word để cập nhật Mục lục, Danh mục hình vẽ, Danh mục bảng biểu và xuất PDF.

Bản dành cho Google Docs (font mã lệnh Courier New, danh mục hình/bảng chuyển thành văn bản tĩnh):

```bash
GDOCS=1 node build_report.js ../BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang_GoogleDocs.docx
powershell -ExecutionPolicy Bypass -File word_update.ps1 -Docx "D:\CSDL_NangCao\BaoCao_TieuLuan_CSDLNC_NguyenHuyHoang_GoogleDocs.docx" -UnlinkLists
```

| Tệp | Nội dung |
|---|---|
| `lib.js` | Định dạng (Times New Roman 13, dãn dòng 1,3, lề 2,5 / 2 / 3,5 / 2 cm), đánh số hình/bảng theo chương |
| `content_front.js` | Bìa, bìa lót, Lời cảm ơn, Mục lục, các danh mục |
| `content_ch1.js` | Mở đầu, Chương 1 |
| `content_ch2.js` | Chương 2 |
| `content_ch3.js` | Chương 3, Kết luận, Tài liệu tham khảo |

Lưu ý: nếu sửa trực tiếp trong Word thì không cần chạy lại các bước trên; nhớ nhấn chuột phải vào Mục lục → Update Field → Update entire table sau khi sửa.
