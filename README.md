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

### 4. ngrok으로 터널링 (ChatGPT 연결용)

```bash
ngrok http 8787
```

ngrok이 제공하는 공개 URL을 사용하여 ChatGPT에 연결할 수 있습니다.

## ChatGPT에 연결하기

1. ChatGPT에서 **Settings → Apps & Connectors → Advanced settings**로 이동하여 개발자 모드 활성화
2. **Settings → Connectors**에서 **Create** 버튼 클릭
3. ngrok URL + `/mcp` 경로 입력 (예: `https://<subdomain>.ngrok.app/mcp`)
4. 이름과 설명을 입력하고 **Create** 클릭
5. 새 채팅을 열고 **More** 메뉴에서 커넥터 추가
6. "Show my tasks" 같은 프롬프트로 테스트

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

