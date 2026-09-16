# Hướng Dẫn Triển Khai PlayVerse & Cấu Hình Tên Miền playverse.senexam.me

Tài liệu này hướng dẫn chi tiết từng bước để bạn đưa ứng dụng **PlayVerse** lên mạng Internet, kết nối cơ sở dữ liệu **Supabase (Free)** và gắn tên miền con **`playverse.senexam.me`**.

---

## BƯỚC 1: KHỞI TẠO BACKEND SUPABASE (HOÀN TOÀN MIỄN PHÍ)

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (hoặc đăng ký bằng GitHub/Google).
2. Bấm **"New Project"**, đặt tên là **`playverse`**, chọn mật khẩu Database và chọn vùng (Region) gần Việt Nam nhất (ví dụ: `Singapore - ap-southeast-1`).
3. Sau khi tạo project xong, nhìn sang thanh menu bên trái, chọn biểu tượng **SQL Editor** (hoặc nhấn `S` sau đó `Q`).
4. Mở file [supabase_schema.sql](file:///c:/Users/hoang/Downloads/playverse/supabase_schema.sql) trong dự án PlayVerse này, sao chép toàn bộ nội dung và dán vào ô SQL Editor trên Supabase.
5. Bấm nút **"Run"** (chạy mã SQL).
   > 🎉 **Xong!** Hệ thống Supabase sẽ tự động tạo đầy đủ:
   > - Bảng `profiles`, `servers`, `server_members`, `channels`, `messages`.
   > - Kích hoạt WebSockets Realtime cho tin nhắn và trạng thái.
   > - Thiết lập trigger tự động tạo kênh `#chung` khi lập server mới.
   > - Thiết lập Storage buckets cho avatar và file ảnh đính kèm.

6. Lấy API Keys:
   - Vào **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái) -> **API**.
   - Sao chép 2 giá trị:
     - **Project URL** (ví dụ: `https://xyzabc.supabase.co`)
     - **anon / public key** (ví dụ: `eyJhbGci...`)

---

## BƯỚC 2: CẤU HÌNH BIẾN MÔI TRƯỜNG DỰ ÁN

1. Trong thư mục `playverse`, tạo file `.env.local` (copy từ `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   NEXT_PUBLIC_APP_URL=https://playverse.senexam.me
   ```

---

## BƯỚC 3: HOST ỨNG DỤNG LÊN VERCEL (MIỄN PHÍ 100%)

Vercel là nền tảng tối ưu nhất cho Next.js, tự động cấp chứng chỉ bảo mật SSL HTTPS:

1. Đẩy mã nguồn thư mục `playverse` lên GitHub (Repository riêng, ví dụ: `github.com/your-username/playverse`).
2. Truy cập [https://vercel.com](https://vercel.com), đăng nhập và chọn **"Add New..."** -> **"Project"**.
3. Chọn repo `playverse` vừa tạo trên GitHub.
4. Ở mục **Environment Variables**, thêm 3 biến như ở Bước 2:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (giá trị: `https://playverse.senexam.me`)
5. Nhấn **"Deploy"**. Vercel sẽ tự động build và chạy app trong khoảng 1 phút.

---

## BƯỚC 4: CẤU HÌNH TÊN MIỀN CON `playverse.senexam.me`

Bạn đang sở hữu tên miền `senexam.me`. Để kích hoạt subdomain `playverse`:

### Trường hợp A: Nếu tên miền được quản lý qua Cloudflare (Khuyên dùng)
1. Đăng nhập vào [dash.cloudflare.com](https://dash.cloudflare.com) -> Chọn tên miền `senexam.me`.
2. Vào mục **DNS** -> **Records** -> Nhấn **Add record**:
   - **Type (Loại bản ghi):** `CNAME`
   - **Name (Tên):** `playverse`
   - **Target (Đích đến):** `cname.vercel-dns.com`
   - **Proxy status:** Chuyển sang màu xám (`DNS only`) lúc đầu để Vercel xác thực nhanh, sau đó có thể bật lại Proxy nếu muốn.
   - **TTL:** `Auto`
3. Nhấn **Save**.

### Trường hợp B: Nếu quản lý tại nhà cung cấp khác (Namecheap, GoDaddy, PA Vietnam, INET, v.v.)
1. Đăng nhập trang quản trị tên miền -> Quản lý DNS của `senexam.me`.
2. Thêm bản ghi mới:
   - **Loại:** `CNAME`
   - **Host / Tên miền con:** `playverse`
   - **Giá trị / Trỏ đến:** `cname.vercel-dns.com`
   - **TTL:** `3600` hoặc `Auto`
3. Lưu lại.

### Sau đó, gắn tên miền trên Vercel:
1. Trong Dashboard dự án trên Vercel, vào tab **Settings** -> **Domains**.
2. Nhập vào ô: `playverse.senexam.me` rồi bấm **Add**.
3. Vercel sẽ tự động kiểm tra bản ghi DNS và cấp phát chứng chỉ SSL (HTTPS) trong 1 - 2 phút.
4. Giờ đây bạn đã có thể truy cập thẳng vào:
   👉 **`https://playverse.senexam.me`**

---

## GIẢI ĐÁP: VỀ VIỆC "BỎ SENEXAM Ở GIỮA (THÀNH PLAYVERSE.ME)"

- **Vì sao không tự bỏ được chữ "senexam"?**
  - Hệ thống phân cấp tên miền toàn cầu (DNS) quy định bạn chỉ có toàn quyền tạo các tên miền con (subdomain) phụ thuộc vào tên miền gốc mà bạn đã mua (`*.senexam.me`).
  - `playverse.me` là một **tên miền gốc độc lập**. Không ai có thể tự biến một subdomain thành một domain gốc khác mà không mua quyền sở hữu nó từ cơ quan quản lý tên miền `.me`.
- **Nếu bạn thực sự muốn địa chỉ chỉ có chữ PlayVerse:**
  - Bạn có thể lên các trang đăng ký tên miền (như Porkbun, Namecheap) kiểm tra xem `playverse.me` (hoặc các đuôi rất rẻ như `playverse.app`, `playverse.xyz`, `playverse.space`...) còn trống không và đăng ký với giá khoảng vài chục nghìn đến hơn 100k/năm.
  - Sau khi mua, bạn chỉ việc gán tên miền đó vào Vercel là xong!
- **Phương án `playverse.senexam.me` hiện tại:**
  - Hoàn toàn miễn phí, không tốn thêm bất kỳ chi phí nào.
  - Rất chuyên nghiệp theo chuẩn dịch vụ công nghệ (như cách các tập đoàn lớn làm: `teams.microsoft.com`, `drive.google.com`, `app.slack.com`).
