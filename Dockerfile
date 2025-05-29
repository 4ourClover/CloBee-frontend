FROM node:18

# 1. serve 설치만
RUN npm install -g serve

# 2. 빌드된 React 정적 파일 복사
WORKDIR /app
COPY . ./appdir

# # 7. 포트 노출 및 CMD (serve + nginx)
EXPOSE 3000
CMD ["serve", "-s", "/app/appdir", "-l", "3000"]
#CMD sh -c "serve -s /app/appdir & nginx -g 'daemon off;'"