FROM node:20-slim

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 파일 복사
COPY . .

# 포트 노출 (Cloud Run은 PORT 환경 변수를 사용)
EXPOSE 8080

# 서버 시작
CMD ["node", "server.js"]

