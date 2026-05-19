# Gunakan image Node.js versi LTS berbasis Alpine agar ringan
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependensi (hanya dependency production)
RUN npm ci --only=production || npm install --production

# Copy seluruh source code backend
COPY . .

# Environment variables dasar (Google Cloud Run butuh PORT)
ENV PORT=8080
ENV NODE_ENV=production

# Buka port 8080
EXPOSE 8080

# Jalankan server
CMD ["npm", "start"]
