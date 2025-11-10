# ChatGPT Apps SDK 퀵스타트 가이드

## ChatGPT Apps SDK란?

ChatGPT Apps SDK는 ChatGPT 내에서 동작하는 커스텀 앱을 만들 수 있게 해주는 도구입니다. Model Context Protocol (MCP)을 사용하여 ChatGPT와 앱 간 통신을 처리합니다.

## 핵심 개념

### 1. MCP 서버 (Model Context Protocol Server)
- ChatGPT와 앱 간의 통신을 담당하는 서버
- **Tools**: ChatGPT가 호출할 수 있는 기능들을 정의
- **Resources**: ChatGPT에 제공할 UI 컴포넌트를 정의

### 2. 웹 컴포넌트 (Web Component)
- ChatGPT 인터페이스 내 iframe으로 렌더링되는 HTML
- `window.openai` API를 통해 ChatGPT와 상호작용
- 사용자에게 시각적인 UI를 제공

### 3. Tools (도구)
- ChatGPT가 사용자 요청에 따라 호출하는 함수들
- 예: "할 일 추가해줘" → `add_todo` 도구 호출
- 각 도구는 입력 스키마와 출력 형식을 정의

### 4. Resources (리소스)
- UI 컴포넌트를 ChatGPT에 제공하는 방법
- HTML 파일을 리소스로 등록하면 ChatGPT가 이를 렌더링

## 동작 흐름

```
1. 사용자가 ChatGPT에 요청
   "할 일 목록 보여줘"
   
2. ChatGPT가 MCP 서버의 도구 호출
   → search_todos() 도구 실행
   
3. MCP 서버가 결과 반환
   → structuredContent에 할 일 목록 포함
   
4. ChatGPT가 웹 컴포넌트 렌더링
   → todo-widget.html을 iframe으로 표시
   
5. 웹 컴포넌트가 데이터 표시
   → window.openai.toolOutput에서 데이터 읽어서 UI 업데이트
```

## 주요 API

### window.openai API (웹 컴포넌트 내에서 사용)

```javascript
// 도구 호출
await window.openai.callTool('add_todo', { title: '새 할 일' });

// 도구 실행 결과 접근
const tasks = window.openai.toolOutput?.tasks ?? [];

// 글로벌 변수 업데이트 이벤트 리스닝
window.addEventListener('openai:set_globals', (event) => {
  const globals = event.detail?.globals;
  // 글로벌 변수 업데이트 처리
});
```

### MCP 서버 API

```javascript
// 도구 등록
server.registerTool(
  'tool_name',
  {
    title: '도구 제목',
    description: '도구 설명',
    inputSchema: { /* Zod 스키마 */ },
    _meta: {
      'openai/outputTemplate': 'ui://widget/template.html',
      'openai/toolInvocation/invoking': '실행 중 메시지',
      'openai/toolInvocation/invoked': '완료 메시지',
    },
  },
  async (args) => {
    // 도구 실행 로직
    return {
      content: [{ type: 'text', text: '결과 메시지' }],
      structuredContent: { /* 구조화된 데이터 */ },
    };
  }
);

// 리소스 등록
server.registerResource(
  'resource-name',
  'ui://widget/template.html',
  {},
  async () => ({
    contents: [{
      uri: 'ui://widget/template.html',
      mimeType: 'text/html+skybridge',
      text: htmlContent,
      _meta: { 'openai/widgetPrefersBorder': true },
    }],
  })
);
```

## 메타데이터 설명

### _meta 필드

- `openai/outputTemplate`: 도구 실행 후 표시할 UI 템플릿
- `openai/toolInvocation/invoking`: 도구 실행 중 표시할 메시지
- `openai/toolInvocation/invoked`: 도구 실행 완료 후 표시할 메시지
- `openai/widgetPrefersBorder`: 위젯에 테두리 표시 여부

## structuredContent

도구 실행 결과를 구조화된 형태로 반환하면, 웹 컴포넌트에서 `window.openai.toolOutput`을 통해 접근할 수 있습니다.

```javascript
// MCP 서버에서 반환
return {
  structuredContent: {
    tasks: [
      { id: '1', title: '할 일 1', completed: false },
      { id: '2', title: '할 일 2', completed: true },
    ],
  },
};

// 웹 컴포넌트에서 접근
const tasks = window.openai.toolOutput?.tasks ?? [];
```

## 테스트 방법

### 1. 로컬 서버 실행
```bash
npm start
```

### 2. MCP Inspector로 테스트
```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

### 3. ngrok으로 터널링
```bash
ngrok http 8787
```

### 4. ChatGPT에 연결
1. ChatGPT 설정에서 개발자 모드 활성화
2. Connectors에서 새 커넥터 생성
3. ngrok URL + `/mcp` 입력
4. 채팅에서 커넥터 추가 후 테스트

## 디버깅 팁

1. **서버 로그 확인**: MCP 서버의 콘솔 로그를 확인하여 도구 호출 여부 확인
2. **브라우저 개발자 도구**: 웹 컴포넌트의 콘솔에서 `window.openai` 객체 확인
3. **MCP Inspector**: 도구와 리소스를 직접 테스트
4. **네트워크 탭**: HTTP 요청/응답 확인

## 다음 단계

1. 퀵스타트 프로젝트 실행 및 테스트
2. EZDEGREE_INTEGRATION.md 문서 참고하여 ezdegree 서비스 접목
3. 실제 API 연동 및 UI 컴포넌트 개발
4. ChatGPT에서 사용자 테스트 및 피드백 수집

