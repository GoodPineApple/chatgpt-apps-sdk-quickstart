# Google Cloud 배포 가이드

이 가이드는 ChatGPT Apps SDK 프로젝트를 Google App Engine 또는 Cloud Run에 배포하는 방법을 설명합니다.

## 목차

1. [Google App Engine 배포](#1-google-app-engine-배포)
2. [Cloud Run 배포](#2-cloud-run-배포)
3. [배포 후 ChatGPT 연결](#3-배포-후-chatgpt-연결)
4. [문제 해결](#4-문제-해결)

---

## 1. Google App Engine 배포

### 사전 준비

1. **Google Cloud 프로젝트 생성**
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택

2. **Google Cloud SDK 설치**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # 또는 직접 다운로드
   # https://cloud.google.com/sdk/docs/install
   ```

3. **Google Cloud 인증**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

### 배포 단계

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd chatgpt-apps-sdk-quickstart
   ```

2. **App Engine 앱 초기화** (처음 배포하는 경우)
   ```bash
   gcloud app create --region=asia-northeast3
   ```
   - `asia-northeast3`는 서울 리전입니다. 원하는 리전을 선택하세요.

3. **배포 실행**
   ```bash
   gcloud app deploy
   ```

4. **배포 확인**
   ```bash
   gcloud app browse
   ```
   또는 배포 후 표시되는 URL을 확인하세요:
   ```
   https://YOUR_PROJECT_ID.an.r.appspot.com
   ```

### 배포 URL 확인

배포가 완료되면 다음과 같은 URL이 생성됩니다:
```
https://YOUR_PROJECT_ID.an.r.appspot.com
```

MCP 엔드포인트는:
```
https://YOUR_PROJECT_ID.an.r.appspot.com/mcp
```

### 환경 변수 설정

`app.yaml` 파일에 환경 변수를 추가할 수 있습니다:

```yaml
env_variables:
  TZ: "Asia/Seoul"
  PORT: "8080"
  CUSTOM_VAR: "value"
```

### 로그 확인

```bash
gcloud app logs tail -s default
```

---

## 2. Cloud Run 배포

Cloud Run은 컨테이너 기반 배포로, 더 유연한 설정이 가능합니다.

### 사전 준비

1. **Google Cloud 프로젝트 설정** (위와 동일)

2. **Docker 설치** (로컬에서 빌드하는 경우)
   ```bash
   # macOS
   brew install --cask docker
   ```

### 배포 방법 1: 소스 코드에서 직접 배포 (권장)

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd chatgpt-apps-sdk-quickstart
   ```

2. **Cloud Run에 배포**
   ```bash
   gcloud run deploy chatgpt-apps-sdk \
     --source . \
     --platform managed \
     --region asia-northeast3 \
     --allow-unauthenticated \
     --port 8080
   ```

   - `--source .`: 현재 디렉토리의 소스 코드에서 빌드
   - `--region`: 배포할 리전 (서울: `asia-northeast3`)
   - `--allow-unauthenticated`: 인증 없이 접근 허용 (ChatGPT 연결용)
   - `--port`: 서버가 사용할 포트

3. **배포 완료 후 URL 확인**
   배포가 완료되면 다음과 같은 URL이 표시됩니다:
   ```
   https://chatgpt-apps-sdk-XXXXX-xx.a.run.app
   ```

### 배포 방법 2: Docker 이미지로 배포

1. **Docker 이미지 빌드**
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/chatgpt-apps-sdk .
   ```

2. **Google Container Registry에 푸시**
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/chatgpt-apps-sdk
   ```

3. **Cloud Run에 배포**
   ```bash
   gcloud run deploy chatgpt-apps-sdk \
     --image gcr.io/YOUR_PROJECT_ID/chatgpt-apps-sdk \
     --platform managed \
     --region asia-northeast3 \
     --allow-unauthenticated \
     --port 8080
   ```

### 환경 변수 설정

Cloud Run 배포 시 환경 변수를 설정할 수 있습니다:

```bash
gcloud run deploy chatgpt-apps-sdk \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "TZ=Asia/Seoul"
```

또는 `--update-env-vars` 플래그 사용:

```bash
gcloud run services update chatgpt-apps-sdk \
  --update-env-vars "TZ=Asia/Seoul,CUSTOM_VAR=value" \
  --region asia-northeast3
```

### 로그 확인

```bash
gcloud run logs tail chatgpt-apps-sdk --region asia-northeast3
```

### 트래픽 분할 (A/B 테스트)

```bash
gcloud run services update-traffic chatgpt-apps-sdk \
  --to-revisions REVISION_NAME=100 \
  --region asia-northeast3
```

---

## 3. 배포 후 ChatGPT 연결

### 1단계: 배포 URL 확인

배포가 완료되면 다음 중 하나의 URL이 생성됩니다:

**App Engine:**
```
https://YOUR_PROJECT_ID.an.r.appspot.com/mcp
```

**Cloud Run:**
```
https://chatgpt-apps-sdk-XXXXX-xx.a.run.app/mcp
```

### 2단계: 배포된 서버 테스트

브라우저에서 다음 URL들을 테스트하세요:

1. **루트 경로 테스트:**
   ```
   https://YOUR_DEPLOYED_URL/
   ```
   "Todo MCP server" 메시지가 표시되어야 합니다.

2. **MCP 엔드포인트 테스트:**
   ```
   https://YOUR_DEPLOYED_URL/mcp
   ```

### 3단계: ChatGPT 커넥터 설정

> **⚠️ 중요**: ChatGPT 커넥터 추가는 UI가 자주 변경되므로, 상세한 가이드는 [CHATGPT_SETUP.md](./CHATGPT_SETUP.md)를 참고하세요.

**간단 요약:**
1. **ChatGPT 웹사이트 접속**: [https://chat.openai.com](https://chat.openai.com)
2. **설정 → Beta features 또는 Apps & Connectors**: 개발자 모드 활성화
3. **Connectors 섹션**: 새 커넥터 생성
4. **URL 입력**: `https://YOUR_DEPLOYED_URL/mcp` (반드시 `/mcp` 포함)
5. **테스트**: 새 채팅에서 커넥터 선택 후 테스트

**자세한 단계별 가이드**: [CHATGPT_SETUP.md](./CHATGPT_SETUP.md) 참고

---

## 4. 문제 해결

### 문제: 배포 후 404 오류

**원인**: 서버가 `PORT` 환경 변수를 올바르게 읽지 못함

**해결**:
- `server.js`에서 `process.env.PORT`를 사용하는지 확인
- App Engine은 자동으로 `PORT` 환경 변수를 설정합니다
- Cloud Run도 `--port` 플래그로 설정한 포트를 사용합니다

### 문제: CORS 오류

**원인**: ChatGPT에서 요청 시 CORS 헤더가 누락됨

**해결**: `server.js`에 이미 CORS 헤더가 설정되어 있는지 확인:
```javascript
res.setHeader("Access-Control-Allow-Origin", "*");
```

### 문제: 배포된 서버가 응답하지 않음

**해결**:
1. 로그 확인:
   ```bash
   # App Engine
   gcloud app logs tail -s default
   
   # Cloud Run
   gcloud run logs tail chatgpt-apps-sdk --region asia-northeast3
   ```

2. 서버가 실행 중인지 확인:
   ```bash
   # App Engine
   gcloud app versions list
   
   # Cloud Run
   gcloud run services describe chatgpt-apps-sdk --region asia-northeast3
   ```

### 문제: 파일을 찾을 수 없음

**원인**: `public/todo-widget.html` 파일이 배포에 포함되지 않음

**해결**:
- `.gcloudignore` 파일이 `public/` 디렉토리를 제외하지 않는지 확인
- `app.yaml`의 `handlers` 설정 확인

### 문제: ChatGPT에서 커넥터 연결 실패

**해결**:
1. 배포된 URL이 HTTPS인지 확인 (HTTP는 작동하지 않음)
2. `/mcp` 경로가 포함되어 있는지 확인
3. 서버 로그에서 요청이 도착하는지 확인
4. 브라우저에서 직접 URL 접근 테스트

---

## 5. 지속적인 배포

### 자동 배포 설정 (선택사항)

GitHub Actions를 사용하여 자동 배포를 설정할 수 있습니다:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: |
          gcloud run deploy chatgpt-apps-sdk \
            --source . \
            --platform managed \
            --region asia-northeast3 \
            --allow-unauthenticated
```

---

## 6. 비용 최적화

### App Engine

- **무료 할당량**: 매일 28시간의 인스턴스 시간
- **과금**: 인스턴스 시간, 네트워크, 저장소 사용량에 따라

### Cloud Run

- **무료 할당량**: 매월 200만 요청, 360,000 GiB-초, 180,000 vCPU-초
- **과금**: 요청 수, 메모리, CPU 사용량에 따라

### 추천

- **개발/테스트**: Cloud Run (무료 할당량이 넉넉함)
- **프로덕션**: 트래픽에 따라 선택 (일반적으로 Cloud Run이 더 경제적)

---

## 7. 다음 단계

배포가 완료되면:

1. ChatGPT에서 커넥터 테스트
2. 서버 로그 모니터링
3. 성능 최적화 (필요한 경우)
4. EZDegree 통합 프로젝트도 동일한 방법으로 배포

---

## 참고 자료

- [Google App Engine 문서](https://cloud.google.com/appengine/docs)
- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Google Cloud SDK 설치](https://cloud.google.com/sdk/docs/install)

