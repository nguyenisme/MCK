# Fresh Music Player

Phiên bản mới có:

- Giao diện sáng, tối giản, responsive.
- Chế độ phát theo lượt.
- Chế độ phát ngẫu nhiên.
- Tạo nhiều playlist.
- Thêm hoặc xóa bài trong playlist.
- Đổi tên và xóa playlist.
- Playlist được lưu bằng Local Storage trên chính trình duyệt.
- Hỗ trợ Media Session để điều khiển nhạc trên màn hình khóa.

## Thêm nhạc

1. Chép 30 file MP3 vào thư mục `songs`.
2. Mở `script.js`.
3. Thay tên trong mảng `songs` bằng đúng tên file thật.

Ví dụ:

```js
const songs = [
  "Anh nho em.mp3",
  "Ngay mai.mp3",
  "Mot bai hat khac.mp3"
];
```

Tên hiển thị sẽ tự bỏ `.mp3`.

## Lưu ý về playlist

Playlist được lưu trong Local Storage:

- Chỉ lưu trên đúng trình duyệt và thiết bị đã tạo.
- Xóa dữ liệu trình duyệt sẽ làm mất playlist.
- Playlist không tự đồng bộ giữa điện thoại và máy tính.

## Đưa lên GitHub Pages

1. Tạo repository mới.
2. Upload toàn bộ file.
3. Vào `Settings` → `Pages`.
4. Chọn `Deploy from a branch`.
5. Chọn branch `main`, thư mục `/root`.
6. Nhấn `Save`.
