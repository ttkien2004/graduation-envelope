# Graduation 3D Mascot Studio — thiệp mời tốt nghiệp Cute/Chibi

Website thiệp mời tốt nghiệp **3D thực sự** với ba linh vật được dựng thủ công bằng hình khối Three.js: **Pingu (penguin)**, **Mochi (bunny)** và **Bơ (bear)**. Không dùng iframe Sketchfab, không cần tải `.glb`, không dùng nhân vật có bản quyền.

Khách truy cập liên kết → nhập tên → mascot bước ra từ xa, vẫy tay, chớp mắt và đưa phong bì → mở thiệp với tên người được mời. Có nút xem lại hoạt ảnh, đổi tên, đổi linh vật (nếu bật), lưu lịch `.ics`, mở bản đồ, sao chép liên kết và gửi lời chúc qua email hoặc sao chép nội dung.

> **Thông tin buổi lễ ban đầu chỉ là dữ liệu ví dụ.** Hãy đổi `src/config.js` trước khi chia sẻ link thật.

## 1. Chọn linh vật qua config

Trong file **`src/mascot.config.js`**:

```js
export const MASCOT_CONFIG = {
  selected: 'penguin', // 'penguin' | 'bunny' | 'bear'
  showPicker: true,     // false: ẩn nút đổi nhân vật khỏi trang
  arrivalDuration: 2.8,
};
```

- `penguin` — **Pingu** 🐧: chim cánh cụt xanh đen và trắng, mũ cử nhân.
- `bunny` — **Mochi** 🐰: thỏ tím pastel, tai dài, mũ cử nhân.
- `bear` — **Bơ** 🐻: gấu nâu caramel, mũ cử nhân.

Đổi `selected` là đủ để đặt nhân vật mặc định. Khi `showPicker: true`, khách có thể chọn một trong ba ngay trên trang; hệ thống tháo nhân vật cũ, dựng nhân vật mới và phát lại hiệu ứng trao thiệp. Cài `showPicker: false` nếu muốn tất cả khách chỉ nhìn thấy nhân vật bạn chọn.

**Quan trọng:** Các linh vật được viết sẵn bằng Three.js, không phải tự tải HTML từ Sketchfab. Thêm nhân vật thứ tư sẽ cần thêm một hàm tạo nhân vật trong `src/mascots/` và khai báo trong registry. Không thể tự biến iframe thành một nhân vật có tay/chân điều khiển được.

## 2. Thay thông tin lễ tốt nghiệp

Chỉnh **`src/config.js`**: `graduate`, `school`, `classYear`, `date`, `startTime`, `endTime`, `venue`, `address`, `mapsUrl`, `rsvpFormUrl`, `contactEmail`, `invitationMessage`. Sau khi nhập dữ liệu thật, đặt `isDemo: false`.

Tên khách chỉ tồn tại trong bộ nhớ trình duyệt của trang đang mở (không gửi lên server, không lưu localStorage hoặc query string). Việc gửi lời chúc mặc định **không** có backend; hệ thống sao chép lời chúc hoặc mở ứng dụng email nếu có cấu hình `contactEmail`.

## 3. Cách A — Chạy để phát triển (Vite)

Yêu cầu Node.js 20.19+ hoặc 22.12+ và kết nối Internet khi cài đặt:

```bash
npm install
npm run dev
```

Mở URL được in ra (thường là `http://localhost:5173`). Vite dùng gói `three` và `gsap` cài trong dự án. Chạy kiểm tra cú pháp và cấu hình:

```bash
npm test
```

Build production:

```bash
npm run build
```

Upload nội dung thư mục `dist/` lên Netlify, Vercel, GitHub Pages hoặc một hosting tĩnh.

## 4. Cách B — Xem thử nhanh không cần npm

Website cũng có **ES Module import map** cho thư viện từ CDN. Chạy HTTP server trong thư mục dự án:

```bash
python -m http.server 5500
```

Mở `http://localhost:5500`. Chế độ này cần Internet để tải Three.js và GSAP từ jsDelivr. Không mở trực tiếp bằng đường dẫn `file:///...` vì trình duyệt có thể chặn JavaScript module. Nếu CDN/WebGL không khả dụng, trang vẫn hiển thị linh vật minh họa CSS và các nút nhận thiệp vẫn hoạt động; tuy nhiên hoạt ảnh 3D đầy đủ sẽ không chạy.

**Bản static deploy** đi kèm trong ZIP riêng có `index.html`, `src/` và `favicon.svg`. Upload toàn bộ nội dung ZIP đã giải nén lên hosting. Bản này cũng phụ thuộc CDN cho 3D. Để tạo bản deploy độc lập CDN, dùng `npm install && npm run build` từ source (các gói sẽ được bundle trong JS production).

## 5. Cấu trúc dự án

```text
index.html
package.json
src/
  config.js                # Thông tin lễ tốt nghiệp
  mascot.config.js         # Chọn preset và bật/tắt bộ chọn
  ui.js                    # Khởi tạo giao diện
  site.js                  # Nhập tên, đổi mascot, thiệp, RSVP
  scene.js                 # Ánh sáng, camera, hoạt ảnh, phong bì Three.js
  styles.css               # Giao diện responsive + CSS fallback
  mascots/
    registry.js            # Ánh xạ ID -> factory
    parts.js               # Hình khối, mũ tốt nghiệp, mắt, màu
    penguin.js             # Model Pingu
    bunny.js               # Model Mochi
    bear.js                # Model Bơ
public/
  favicon.svg
tests/
  mascot.test.mjs
```

### Contract của model 3D

Mỗi factory trả về `{ group, head, arms, feet, eyes, defaultArmAngles, waveArmAngle }`. `scene.js` dùng chung các bộ phận để tạo **bước chân / chớp mắt / nhún nhẹ / nghiêng đầu / vẫy tay / trao thiệp**. Nút đổi nhân vật phát sự kiện `mascot:change` và animation sẽ phát lại, không thay code của thiệp.

## 6. Lưu ý và giới hạn

- Các model **dựng từ hình khối** (phong cách 3D Chibi), không phải tác phẩm 3D anime chi tiết như model Sketchfab.
- Phong bì là **một vật thể 3D riêng**, được điều khiển bằng GSAP để tạo cảm giác nhân vật đưa phong bì về phía camera; không có inverse kinematics/bàn tay tự động bám phong bì.
- Nhấn phong bì (raycast) hoặc nút **Nhận thiệp mời** để mở thiệp.
- Có `prefers-reduced-motion` để giảm hoạt ảnh nếu hệ điều hành yêu cầu.
- Model đã được tích hợp sẵn trong source; không cần thêm ảnh, model GLB, tài khoản Sketchfab hay API key.
- Website mẫu chưa gửi xác nhận tham dự vào database; `rsvpFormUrl` có thể trỏ tới biểu mẫu bên ngoài.

## 7. Kiểm tra đã thực hiện

- `npm test`: kiểm tra ba preset, các thành phần UI, sự kiện, và cú pháp tất cả file JS.
- Kiểm thử tương tác qua Playwright trên desktop và điện thoại bằng cách nạp giao diện: tên rỗng bị chặn; nhập tên có dấu; ba preset; mở thiệp; đổi tên. Các bước này **đã kiểm tra thành công**.
- **Chưa xác minh trực tiếp hình ảnh WebGL và GSAP trong trình duyệt ở môi trường tạo dự án** vì npm registry bị lỗi DNS và trình duyệt chặn điều hướng HTTP localhost. Cần chạy thử bằng trình duyệt có Internet/WebGL trên máy của bạn để xác nhận chuyển động 3D trước khi công khai.
