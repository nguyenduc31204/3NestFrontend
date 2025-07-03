# Giai đoạn 1: Build frontend
FROM node:18-alpine as builder
WORKDIR /app

# Cài dependencies
COPY package*.json ./
RUN npm install

# Copy source code và build
COPY . .
RUN npm run build

# Giai đoạn 2: Serve static files
FROM node:18-alpine
WORKDIR /app

# Cài tool để serve static site
RUN npm install -g serve

# Copy build từ giai đoạn trước
COPY --from=builder /app/dist .

# Expose Cloud Run default port
EXPOSE 8080

# Chạy site ở chế độ production
CMD ["serve", "-s", ".", "-l", "8080"]
