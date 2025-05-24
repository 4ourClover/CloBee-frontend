# 1단계: React 앱 빌드
FROM node:18 AS builder

WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 전체 소스 복사
COPY . .

# 환경변수 복사 (옵션: 없으면 생략 가능)
COPY .env .env

# 빌드 실행
RUN npm run build

# 2단계: Nginx로 정적 파일 서비스 + HTTPS 인증서 적용
FROM nginx:stable-alpine

# openssl 설치 및 인증서 생성
RUN apk add --no-cache openssl && \
    mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/nginx.key \
        -out /etc/ssl/certs/nginx.crt \
        -subj "/CN=localhost"

# React build 결과물 복사
COPY --from=builder /app/build /usr/share/nginx/html

# nginx 설정 덮어쓰기
RUN printf "server {\n\
    listen 443 ssl;\n\
    server_name localhost;\n\
    ssl_certificate /etc/ssl/certs/nginx.crt;\n\
    ssl_certificate_key /etc/ssl/private/nginx.key;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files \$uri /index.html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 443

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
