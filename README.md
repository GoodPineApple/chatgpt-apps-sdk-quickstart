# ChatGPT Apps SDK Quickstart - Todo App

이 프로젝트는 OpenAI의 ChatGPT Apps SDK 퀵스타트 가이드를 따라 만든 Todo 앱입니다.

## 프로젝트 구조

```
chatgpt-apps-sdk-quickstart/
├── public/
│   └── todo-widget.html    # ChatGPT에 표시될 웹 컴포넌트
├── server.js               # MCP 서버 (Model Context Protocol)
├── package.json
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 서버 실행

```bash
npm start
```

서버가 `http://localhost:8787/mcp`에서 실행됩니다.

### 3. MCP Inspector로 테스트 (선택사항)

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

### 4. 배포 방법 선택

#### 옵션 1: Google Cloud 배포 (권장)

Google App Engine 또는 Cloud Run에 배포하여 안정적인 공개 URL을 얻을 수 있습니다.

```bash
# App Engine 배포
gcloud app deploy

# 또는 Cloud Run 배포
gcloud run deploy chatgpt-apps-sdk --source . --platform managed --region asia-northeast3 --allow-unauthenticated --port 8080
```

> **상세한 배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참고하세요.

#### 옵션 2: ngrok 사용 (로컬 개발용)

로컬 개발 환경에서 빠르게 테스트하려면 ngrok을 사용할 수 있습니다.

```bash
ngrok http 8787
```

> **상세한 설정 방법**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참고하세요.

## ChatGPT에 연결하기

> **⚠️ 중요**: ChatGPT UI는 자주 변경되므로, 상세한 단계별 가이드는 **[CHATGPT_SETUP.md](./CHATGPT_SETUP.md)**를 반드시 참고하세요.

### 빠른 요약

1. **배포된 URL 확인**:
   - App Engine: `https://YOUR_PROJECT_ID.an.r.appspot.com/mcp`
   - Cloud Run: `https://chatgpt-apps-sdk-XXXXX-xx.a.run.app/mcp`

2. **ChatGPT 설정**:
   - ChatGPT Plus 구독 필요할 수 있음
   - Settings → Beta features 또는 Apps & Connectors에서 개발자 모드 활성화
   - Connectors에서 새 커넥터 생성
   - 배포된 URL + `/mcp` 입력

3. **테스트**:
   - 새 채팅에서 커넥터 선택
   - "Show my tasks" 프롬프트로 테스트

### 상세 가이드

- **ChatGPT 커넥터 설정**: [CHATGPT_SETUP.md](./CHATGPT_SETUP.md) - 개발자 모드 활성화부터 커넥터 추가까지 상세 설명
- **ngrok 사용 (로컬 개발)**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 로컬 개발 환경 설정

## 주요 개념

### 1. MCP 서버 (Model Context Protocol)
- ChatGPT와 앱 간 통신을 담당하는 서버
- Tools를 등록하여 ChatGPT가 호출할 수 있는 기능을 정의
- Resources를 등록하여 UI 컴포넌트를 제공

### 2. 웹 컴포넌트
- ChatGPT 인터페이스 내 iframe으로 렌더링되는 HTML
- `window.openai` API를 통해 ChatGPT와 상호작용
- `window.openai.callTool()`: 도구 호출
- `window.openai.toolOutput`: 도구 실행 결과 접근

### 3. Tools
- `add_todo`: 새로운 할 일 추가
- `complete_todo`: 할 일 완료 처리

## 동작 방식

1. 사용자가 ChatGPT에서 "할 일 추가" 요청
2. ChatGPT가 MCP 서버의 `add_todo` 도구 호출
3. MCP 서버가 도구 실행 후 결과 반환 (structuredContent 포함)
4. ChatGPT가 웹 컴포넌트를 렌더링하고 데이터 전달
5. 웹 컴포넌트가 `window.openai.toolOutput`에서 데이터를 읽어 UI 업데이트

