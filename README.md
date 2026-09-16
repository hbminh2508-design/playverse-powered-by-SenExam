# 🌌 PlayVerse — Nền Tảng Giao Tiếp Cộng Đồng Tự Chủ (Discord-Like)

PlayVerse là một ứng dụng giao tiếp thời gian thực phong cách Discord, được xây dựng độc lập với mục tiêu giúp bạn **làm chủ 100% dữ liệu**, tối ưu chi phí (0 VNĐ trên gói Free của Supabase) và sẵn sàng vận hành trên tên miền riêng **`playverse.senexam.me`**.

---

## ✨ Tính Năng Nổi Bật

- 🎨 **Giao Diện Chuẩn Discord (Dark Theme)**:
  - Thanh Server dọc bên trái với hiệu ứng pill và tooltips.
  - Danh sách kênh chat văn bản (`#`) và kênh đàm thoại (`🔊`).
  - Thanh trạng thái người dùng ở góc dưới với nút bật/tắt Micro, Tai nghe, Cài đặt.
  - Khung chat trung tâm với avatar, ngày giờ, xem trước ảnh và định dạng văn bản.
  - Thanh danh sách thành viên trực tuyến / ngoại tuyến phân cấp theo Role (Chủ sở hữu 👑, Quản trị viên 🛡️, Thành viên).
- ⚡ **Supabase Realtime**:
  - Gửi và nhận tin nhắn tức thì bằng WebSockets không cần tải lại trang.
  - Trạng thái hoạt động (Trực tuyến, Chờ, Không làm phiền, Ẩn danh).
- 🔐 **Bảo Mật & Phân Quyền**:
  - Tích hợp Supabase Auth với cơ chế Row Level Security (RLS) của PostgreSQL.
- 🚀 **Chế Độ Demo Sẵn Có**:
  - Ứng dụng tích hợp sẵn dữ liệu mẫu để bạn và người dùng có thể trải nghiệm toàn bộ tính năng giao diện ngay lập tức mà không bắt buộc phải cấu hình database ngay từ đầu.
- 🔗 **Hệ Thống Lời Mời (Invite System)**:
  - Tạo link mời bạn bè gia nhập server với mã mời độc nhất (`playverse.senexam.me/invite/CODE`).

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL, Realtime WebSockets, Storage, Auth)
- **Deployment**: Vercel (kết nối tên miền con `playverse.senexam.me`)

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Development)

1. Cài đặt thư viện:
   ```bash
   npm install
   ```

2. Cấu hình biến môi trường:
   Sao chép `.env.example` thành `.env.local` và điền thông tin Supabase của bạn (nếu có):
   ```bash
   cp .env.example .env.local
   ```

3. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm PlayVerse!

---

## 📖 Hướng Dẫn Triển Khai & Cấu Hình DNS

Xem hướng dẫn chi tiết từng bước tạo Database Supabase và trỏ tên miền `playverse.senexam.me` tại:
👉 [DNS_DEPLOY_GUIDE.md](./DNS_DEPLOY_GUIDE.md)

File SQL tạo database:
👉 [supabase_schema.sql](./supabase_schema.sql)
