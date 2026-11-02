# 💗 NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💌

Website tương tác tỏ tình lãng mạn, dễ thương được thiết kế dưới dạng bài trắc nghiệm tình cảm bí mật. Người tạo có thể tùy biến tên của mình và người ấy, gửi đường link để crush trả lời, và bí mật nhận toàn bộ câu trả lời về khu vực quản trị riêng tư!

---

## ✨ Điểm Nổi Bật

1. **Linh Vật Tương Tác Biểu Cảm (Bé Thỏ Mochi 🐰)**:
   - Một bé thỏ bánh mochi siêu đáng yêu bằng SVG vector sắc nét, biết cử động tai, nháy mắt, đỏ mặt và cầm đạo cụ (bức thư, trái tim đập thình thịch, giơ tay ăn mừng).
   - **Bong bóng thoại cảm xúc**: Thỏ Mochi sẽ đồng hành và trò chuyện với crush qua từng câu hỏi.
   - **Phản ứng khi rê chuột qua đáp án**: Khi crush hover vào đáp án (như *"Có, mình thích cậu! ❤️"*), mắt thỏ sẽ biến thành hình trái tim rộn ràng `(😍)` hoặc đỏ mặt ngại ngùng `(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄`.
   - **Tính năng tương tác (Poke)**: Crush có thể chạm/click vào chú thỏ để thỏ nảy lên búng má (Squish), bắn pháo tim và nói những câu ngại ngùng dễ thương!

2. **Giao Diện Pastel & Lãng Mạn**:
   - Tông màu chủ đạo: Hồng pastel (`#ff6584`, `#ff85a2`), trắng tinh khôi, đỏ nhẹ.
   - Hiệu ứng cánh hoa anh đào (Sakura) chao lượn và bong bóng trái tim bay nhẹ nhàng ở 60 FPS (Canvas).
   - Pháo hoa trái tim & hiệu ứng rung động khi chọn từng đáp án.
   - Thiết kế tối ưu hiển thị mượt mà trên cả điện thoại (iOS, Android) lẫn máy tính.

2. **Âm Thanh Ngọt Ngào (Web Audio API)**:
   - Nhạc nền Music Box lofi êm dịu, ấm áp được tạo trực tiếp qua Web Audio API (hoàn toàn không lo đứt link âm thanh hay lỗi mạng).
   - Nút bật/tắt nhạc nền 🎵 nổi tiện lợi.
   - Âm thanh tương tác "pop" bong bóng khi nhấn chọn và giai điệu ăn mừng hạnh phúc khi hoàn thành.

3. **Luồng Trắc Nghiệm 5 Câu Hỏi**:
   - **Màn hình mở đầu**: Bức thư với lời nhắn gửi chân thành.
   - **5 Câu hỏi trắc nghiệm**:
     - *Câu 1*: Cậu có đang thích ai không?
     - *Câu 2*: Nếu có người nói thích cậu, cậu sẽ cảm thấy thế nào?
     - *Câu 3*: Cậu có muốn tìm hiểu một người đặc biệt không?
     - *Câu 4*: Nếu người đó là người đang gửi cậu website này thì sao?
     - *Câu 5 (Quan trọng nhất)*: **CẬU CÓ THÍCH MÌNH KHÔNG? 🥺💗**
   - **Màn hình kết quả**: Lời phản hồi cảm xúc thay đổi linh hoạt theo đáp án Câu 5.
   - Không thể bỏ qua câu hỏi; có thanh tiến trình và nút quay lại câu trước.

4. **Khu Vực Quản Trị Bí Mật (`/admin`)**:
   - Bảo mật bằng mã PIN riêng (Mã PIN mặc định: **`1314`** - Trọn đời trọn kiếp 💗).
   - Thống kê tỷ lệ phản hồi: Đồng ý thích ❤️, Có cảm tình 💗, Muốn tìm hiểu ✨, Bạn bè 🤝.
   - Xem chi tiết từng câu trả lời, thời gian người ấy trả lời và số giây hoàn thành.
   - Xuất dữ liệu ra file Excel / CSV (hỗ trợ tiếng Việt có dấu UTF-8 BOM).
   - Nút sao chép tóm tắt kết quả gửi qua chat.
   - Chức năng đổi mã PIN bảo mật bất kỳ lúc nào.

5. **Công Cụ Tạo Link Tùy Biến (Link Generator)**:
   - Nhập tên người ấy (`to`) và tên của bạn (`from`) để tạo link riêng (ví dụ: `/?to=Bé%20Ngọc&from=Minh`).
   - Lời chào trên website sẽ tự động cá nhân hóa: *"Xin chào Bé Ngọc! 💗 Thư gửi từ: Minh 💌"*.

---

## 🚀 Hướng Dẫn Chạy Website

### Yêu cầu:
- Đã cài đặt **Node.js** (phiên bản 18 trở lên).
- **Không cần cài đặt thư viện ngoài (Zero npm install)**: Sử dụng 100% module tích hợp của Node.js, khởi động tức thì!

### Khởi động Server:
Mở terminal tại thư mục này và gõ:
```bash
node server.js
```
Hoặc:
```bash
npm start
```

Mở trình duyệt:
- **Trang trắc nghiệm dành cho crush**: [http://localhost:3000](http://localhost:3000)
- **Trang quản trị xem câu trả lời bí mật**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Mã PIN mặc định: `1314`)*

---

## 📁 Cấu Trúc Dự Án

```
crush-quiz/
├── data/
│   ├── responses.json     # File lưu trữ dữ liệu câu trả lời của crush
│   └── settings.json      # File lưu mã PIN quản trị và cài đặt
├── public/
│   ├── assets/
│   │   └── favicon.svg    # Icon trái tim hồng
│   ├── css/
│   │   └── style.css      # Toàn bộ hiệu ứng, layout pastel lãng mạn
│   ├── js/
│   │   ├── app.js         # Logic trắc nghiệm, chuyển cảnh, gửi kết quả
│   │   ├── audio.js       # Bộ tổng hợp âm thanh Web Audio API & nhạc nền
│   │   ├── canvas-fx.js   # Hiệu ứng cánh hoa anh đào và trái tim bay 60fps
│   │   └── admin.js       # Bảng điều khiển quản trị, thống kê, xuất file
│   ├── index.html         # Giao diện chính của bài trắc nghiệm
│   └── admin.html         # Giao diện quản trị bảo mật
├── package.json
├── server.js              # Server backend REST API Node.js hiệu năng cao
└── test-server.js         # Bộ kiểm thử tự động toàn diện
```

---

## 💌 Chúc hai bạn sớm thành đôi và có những khoảnh khắc thật ngọt ngào!

