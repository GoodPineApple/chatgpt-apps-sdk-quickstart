# ChatGPT Apps SDK Quickstart - Todo App

이 프로젝트는 OpenAI의 ChatGPT Apps SDK 퀵스타트 가이드를 따라 만든 Todo 앱입니다. **공식 문서의 예제 코드를 그대로 사용하면 ChatGPT 커넥터 등록이 실패하는 문제를 해결**하여 실제로 작동하는 구현을 제공합니다.

## 📝 프로젝트 소개 (GitHub 공유용)

ChatGPT Apps SDK는 ChatGPT 내에서 동작하는 커스텀 앱을 만들 수 있게 해주는 도구입니다. 공식 문서의 예제 코드를 그대로 사용하면 커넥터 등록이 실패하는데, 이는 HEAD 요청 미처리, Accept 헤더 무시, 요청 본문 스트림 처리 문제 때문입니다. 본 프로젝트는 이러한 문제를 해결하여 Google Cloud Run에 배포하고, ChatGPT Plus 구독 후 개발자 모드를 활성화하여 앱을 추가하면 바로 사용할 수 있도록 구현했습니다.

## 🎯 주요 개선사항

공식 문서의 예제 코드를 그대로 사용하면 ChatGPT 커넥터 등록이 실패합니다. 다음 수정사항을 적용하여 성공적으로 작동하도록 했습니다:

### 1. HEAD 요청 처리 추가
ChatGPT가 연결 테스트를 위해 HEAD 요청을 보내는데, 이를 처리하지 않으면 404 오류가 발생합니다.
- Health check에서 HEAD 요청 처리
- MCP 엔드포인트에서도 HEAD 요청 지원

### 2. Accept 헤더 기반 응답 형식 결정
ChatGPT는 POST 요청에는 JSON을, GET 요청에는 SSE(Server-Sent Events)를 기대합니다.
- `accept: application/json` → JSON 응답
- `accept: text/event-stream` → SSE 스트리밍 응답
- `enableJsonResponse` 옵션을 동적으로 설정

### 3. 요청 본문 스트림 처리 개선
Node.js HTTP 스트림은 한 번만 읽을 수 있으므로, 요청 본문을 미리 읽으면 transport가 읽지 못합니다.
- 요청 본문을 미리 읽지 않고 transport가 직접 읽도록 수정

### 4. 상세한 로깅 추가
디버깅을 위해 요청 ID, User-Agent, 헤더, 응답 시간 등을 상세히 로깅합니다.

## 프로젝트 구조

```
chatgpt-apps-sdk-quickstart/
├── public/
│   └── todo-widget.html    # ChatGPT에 표시될 웹 컴포넌트
├── server.js               # MCP 서버 (Model Context Protocol)
├── package.json
├── app.yaml                # Google App Engine 배포 설정
├── Dockerfile              # Cloud Run 배포용
└── README.md
```

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 로컬 실행

```bash
npm start
```

서버가 `http://localhost:8787/mcp`에서 실행됩니다.

### 3. 배포 (Google Cloud Run 권장)

```bash
# Google Cloud SDK 설치 및 인증
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Cloud Run에 배포
gcloud run deploy chatgpt-apps-sdk \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080
```

배포 후 생성된 URL: `https://YOUR_SERVICE-XXXXX-xx.a.run.app/mcp`

### 4. ChatGPT에 연결

1. **ChatGPT Plus 구독** 필요
2. **개발자 모드 활성화**:
   - Settings → Beta features 또는 Apps & Connectors
   - Developer mode 토글 ON
3. **커넥터 생성**:
   - Settings → Connectors → Create
   - URL 입력: `https://YOUR_SERVICE-XXXXX-xx.a.run.app/mcp`
   - 인증: "인증없음" 선택
4. **테스트**:
   - 새 채팅 시작
   - 커넥터 선택
   - "Show my tasks" 입력

## 핵심 개념

### MCP 서버 (Model Context Protocol)
- ChatGPT와 앱 간 통신을 담당하는 서버
- **Tools**: ChatGPT가 호출할 수 있는 기능 정의 (`add_todo`, `complete_todo`)
- **Resources**: ChatGPT에 제공할 UI 컴포넌트 정의 (`todo-widget.html`)

### 웹 컴포넌트
- ChatGPT 인터페이스 내 iframe으로 렌더링되는 HTML
- `window.openai.callTool()`: 도구 호출
- `window.openai.toolOutput`: 도구 실행 결과 접근

### 동작 흐름

```
사용자: "할 일 추가해줘"
  ↓
ChatGPT: POST /mcp → add_todo 도구 호출
  ↓
서버: 할 일 추가 → structuredContent 반환
  ↓
ChatGPT: todo-widget.html 렌더링
  ↓
위젯: window.openai.toolOutput에서 데이터 읽어서 표시
```

## 주요 코드 구조

### MCP 서버 설정

```javascript
// Tools 등록
server.registerTool("add_todo", {
  title: "Add todo",
  description: "Creates a todo item with the given title.",
  inputSchema: { title: z.string().min(1) },
  _meta: {
    "openai/outputTemplate": "ui://widget/todo.html",
  },
}, async (args) => {
  // 도구 실행 로직
  return {
    content: [{ type: "text", text: "Added todo" }],
    structuredContent: { tasks: todos },
  };
});

// Resources 등록
server.registerResource("todo-widget", "ui://widget/todo.html", {}, async () => ({
  contents: [{
    uri: "ui://widget/todo.html",
    mimeType: "text/html+skybridge",
    text: todoHtml,
  }],
}));
```

### HTTP 서버 설정

```javascript
// Accept 헤더에 따라 응답 형식 결정
const wantsSSE = acceptHeader.includes("text/event-stream");
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // stateless mode
  enableJsonResponse: !wantsSSE, // SSE를 원하면 false
});
```

## 문제 해결

### 커넥터 등록 실패
- **HEAD 요청 처리 확인**: 서버가 HEAD 요청을 200으로 응답하는지 확인
- **URL 형식 확인**: 반드시 `/mcp` 경로 포함, HTTPS 필수
- **서버 로그 확인**: Cloud Run 로그에서 ChatGPT 요청이 도착하는지 확인

### 400 오류
- **요청 본문 스트림**: 요청 본문을 미리 읽지 않도록 확인
- **Content-Type 헤더**: Accept 헤더에 맞는 Content-Type 설정

### SSE 스트리밍 문제
- **Accept 헤더 확인**: `text/event-stream`을 요청하는지 확인
- **enableJsonResponse**: SSE를 원할 때는 `false`로 설정

## 참고 자료

- [OpenAI Apps SDK 공식 문서](https://developers.openai.com/apps-sdk)
- [MCP 프로토콜 문서](https://platform.openai.com/docs/mcp)
- [EZDegree 통합 가이드](./EZDEGREE_INTEGRATION.md) - EZDegree 서비스 연동 방법

## 라이선스

MIT
