# Giai đoạn 1: Sử dụng một image Node.js gọn nhẹ làm nền tảng
# 'alpine' là một phiên bản Linux rất nhỏ, giúp image cuối cùng nhẹ hơn.
FROM node:18-alpine

# Thiết lập thư mục làm việc mặc định bên trong container là /app.
# Mọi lệnh sau đó sẽ được thực thi trong thư mục này.
WORKDIR /app

# Sao chép package.json và package-lock.json (hoặc yarn.lock) vào trước.
# Docker sẽ cache lại bước này. Nếu các file này không thay đổi,
# Docker sẽ không phải chạy lại "npm install" ở lần build sau, giúp tiết kiệm thời gian.
COPY package*.json ./

# Chạy lệnh để cài đặt tất cả các thư viện đã định nghĩa trong package.json.
RUN npm install

# Sao chép toàn bộ code còn lại từ thư mục frontend trên máy của bạn
# vào thư mục làm việc /app bên trong container.
COPY . .

# Mở port 3000 của container để có thể truy cập từ bên ngoài.
# Port này phải khớp với port mà React dev server đang chạy.
EXPOSE 3000

# Lệnh mặc định sẽ được chạy khi container khởi động.
# Nó sẽ thực thi script "dev" trong file package.json của bạn.
CMD ["npm", "run", "dev"]