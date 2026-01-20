# ===== BUILD =====
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ===== RUNTIME =====
FROM nginx:alpine

COPY --from=builder /app/.next /usr/share/nginx/html/.next
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
