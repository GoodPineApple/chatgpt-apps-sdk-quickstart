# 문제 해결 가이드

ChatGPT Apps SDK 설정 및 사용 중 발생할 수 있는 문제와 해결 방법을 정리했습니다.

## 목차

1. [ChatGPT 설정 문제](#1-chatgpt-설정-문제)
2. [서버 배포 문제](#2-서버-배포-문제)
3. [연결 문제](#3-연결-문제)
4. [기능 작동 문제](#4-기능-작동-문제)

---

## 1. ChatGPT 설정 문제

### 문제: "Developer mode" 옵션이 보이지 않음

**가능한 원인:**
- ChatGPT Plus 구독이 필요
- 기능이 아직 계정에 활성화되지 않음
- 브라우저 캐시 문제
- UI 업데이트로 위치 변경

**해결 방법:**

1. **Plus 구독 확인**
   ```
   https://chat.openai.com/account/billing
   ```
   - Plus 구독이 없다면 구독 필요

2. **다른 위치 확인**
   - Settings → **Beta features** 탭
   - Settings → **Apps & Connectors** 탭
   - Settings → **Advanced** 섹션
   - 왼쪽 사이드바 하단

3. **브라우저 캐시 삭제**
   - Chrome: Cmd+Shift+Delete (Mac) 또는 Ctrl+Shift+Delete (Windows)
   - 시크릿 모드에서 테스트

4. **계정 재로그인**
   - 완전히 로그아웃 후 다시 로그인

5. **다른 브라우저 시도**
   - Chrome, Edge, Safari 등

**참고**: [CHATGPT_SETUP.md](./CHATGPT_SETUP.md)에서 상세한 위치 안내 확인

---

### 문제: "Connectors" 섹션이 보이지 않음

**해결 방법:**

1. 개발자 모드가 활성화되었는지 확인
2. 페이지 새로고침 (F5 또는 Cmd+R)
3. ChatGPT 웹사이트를 완전히 종료하고 다시 접속
4. 브라우저 확장 프로그램 비활성화 (특히 ChatGPT 관련 확장)

---

### 문제: 커넥터 추가 버튼이 없음

**해결 방법:**

1. 개발자 모드가 활성화되어 있는지 확인
2. ChatGPT Plus 구독 확인
3. 다른 브라우저에서 시도
4. OpenAI 지원팀에 문의: [https://help.openai.com](https://help.openai.com)

---

## 2. 서버 배포 문제

### 문제: 배포 후 404 오류

**원인**: 서버가 `PORT` 환경 변수를 올바르게 읽지 못함

**해결 방법:**

1. **server.js 확인**
   ```javascript
   const port = Number(process.env.PORT ?? 8787);
   ```
   - `process.env.PORT`를 사용하는지 확인

2. **App Engine 확인**
   - `app.yaml`에 `PORT: "8080"` 설정이 있는지 확인
   - App Engine은 자동으로 `PORT` 환경 변수를 설정합니다

3. **Cloud Run 확인**
   - `--port 8080` 플래그 사용 확인
   ```bash
   gcloud run deploy chatgpt-apps-sdk \
     --source . \
     --port 8080 \
     ...
   ```

4. **로그 확인**
   ```bash
   # App Engine
   gcloud app logs tail -s default
   
   # Cloud Run
   gcloud run logs tail chatgpt-apps-sdk --region asia-northeast3
   ```

---

### 문제: 배포 중 오류 발생

**일반적인 오류:**

1. **"Permission denied"**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **"Project not found"**
   ```bash
   # 프로젝트 목록 확인
   gcloud projects list
   
   # 올바른 프로젝트 선택
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **"Billing not enabled"**
   - Google Cloud Console에서 결제 계정 연결 필요
   - 무료 할당량 내에서는 비용이 발생하지 않지만, 결제 계정은 필요

---

### 문제: 파일을 찾을 수 없음

**원인**: `public/todo-widget.html` 파일이 배포에 포함되지 않음

**해결 방법:**

1. **`.gcloudignore` 확인**
   - `public/` 디렉토리가 제외되지 않았는지 확인

2. **로컬에서 파일 존재 확인**
   ```bash
   ls -la public/todo-widget.html
   ```

3. **배포 파일 확인**
   ```bash
   gcloud app deploy --dry-run
   ```

---

## 3. 연결 문제

### 문제: ChatGPT에서 커넥터 연결 실패

**확인 사항:**

1. **URL 형식 확인**
   - ✅ 올바른 형식: `https://example.com/mcp`
   - ❌ 잘못된 형식: `http://example.com/mcp` (HTTPS 필수)
   - ❌ 잘못된 형식: `https://example.com` (`/mcp` 경로 누락)

2. **서버 상태 확인**
   ```bash
   # 브라우저에서 직접 접속 테스트
   curl https://YOUR_URL/
   curl https://YOUR_URL/mcp
   ```

3. **CORS 설정 확인**
   - `server.js`에 CORS 헤더가 설정되어 있는지 확인:
   ```javascript
   res.setHeader("Access-Control-Allow-Origin", "*");
   ```

4. **서버 로그 확인**
   - 배포된 서버의 로그에서 요청이 도착하는지 확인
   - ChatGPT에서 요청을 보낼 때 로그에 나타나야 함

---

### 문제: CORS 오류

**브라우저 콘솔에 표시되는 오류:**
```
Access to fetch at 'https://...' from origin 'https://chat.openai.com' has been blocked by CORS policy
```

**해결 방법:**

1. **server.js의 CORS 헤더 확인**
   ```javascript
   if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
     res.writeHead(204, {
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
       "Access-Control-Allow-Headers": "content-type, mcp-session-id",
       "Access-Control-Expose-Headers": "Mcp-Session-Id",
     });
     res.end();
     return;
   }
   ```

2. **모든 MCP 요청에 CORS 헤더 추가 확인**
   ```javascript
   if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
     res.setHeader("Access-Control-Allow-Origin", "*");
     res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
     // ...
   }
   ```

---

### 문제: "Connection refused" 또는 타임아웃

**해결 방법:**

1. **서버가 실행 중인지 확인**
   ```bash
   # App Engine
   gcloud app versions list
   
   # Cloud Run
   gcloud run services describe chatgpt-apps-sdk --region asia-northeast3
   ```

2. **방화벽 설정 확인**
   - Google Cloud Console에서 방화벽 규칙 확인
   - Cloud Run은 기본적으로 공개 접근 허용

3. **네트워크 연결 확인**
   ```bash
   ping YOUR_DEPLOYED_URL
   ```

---

## 4. 기능 작동 문제

### 문제: 위젯이 표시되지 않음

**해결 방법:**

1. **브라우저 개발자 도구 확인**
   - F12 또는 Cmd+Option+I
   - Console 탭에서 오류 확인
   - Network 탭에서 리소스 로딩 확인

2. **window.openai 객체 확인**
   ```javascript
   // 브라우저 콘솔에서
   console.log(window.openai);
   ```

3. **structuredContent 확인**
   - MCP 서버가 `structuredContent`를 올바르게 반환하는지 확인
   - 서버 로그에서 응답 내용 확인

---

### 문제: 도구가 호출되지 않음

**해결 방법:**

1. **도구 이름 확인**
   - ChatGPT 프롬프트에서 사용한 도구 이름이 정확한지 확인
   - `server.js`에 등록된 도구 이름과 일치해야 함

2. **도구 설명 확인**
   - 도구의 `description`이 명확한지 확인
   - ChatGPT가 언제 도구를 호출해야 하는지 이해할 수 있어야 함

3. **서버 로그 확인**
   - 도구 호출 요청이 서버에 도착하는지 확인
   - 오류 메시지 확인

---

### 문제: 데이터가 표시되지 않음

**해결 방법:**

1. **structuredContent 형식 확인**
   ```javascript
   return {
     content: [{ type: "text", text: "메시지" }],
     structuredContent: {
       tasks: [...], // 위젯에서 사용할 데이터
     },
   };
   ```

2. **위젯에서 데이터 접근 확인**
   ```javascript
   // todo-widget.html에서
   let tasks = [...(window.openai?.toolOutput?.tasks ?? [])];
   ```

3. **이벤트 리스너 확인**
   ```javascript
   window.addEventListener("openai:set_globals", handleSetGlobals, {
     passive: true,
   });
   ```

---

## 일반적인 디버깅 방법

### 1. 로컬에서 먼저 테스트

```bash
# 서버 실행
npm start

# MCP Inspector로 테스트
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

### 2. 단계별 확인

1. 로컬 서버가 정상 작동하는지 확인
2. MCP Inspector에서 도구가 정상 작동하는지 확인
3. 배포 후 브라우저에서 직접 접속 테스트
4. ChatGPT 커넥터 연결 테스트

### 3. 로그 모니터링

```bash
# App Engine
gcloud app logs tail -s default

# Cloud Run
gcloud run logs tail chatgpt-apps-sdk --region asia-northeast3 --follow
```

### 4. 네트워크 요청 확인

브라우저 개발자 도구의 Network 탭에서:
- 요청이 전송되는지 확인
- 응답 상태 코드 확인 (200, 404, 500 등)
- 응답 내용 확인

---

## 추가 도움말

- **상세 설정 가이드**: [CHATGPT_SETUP.md](./CHATGPT_SETUP.md)
- **배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **공식 문서**: [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- **지원 요청**: [OpenAI 지원 센터](https://help.openai.com)

---

## 문제가 해결되지 않으면

1. **서버 로그 확인**: 배포된 서버의 로그에서 오류 메시지 확인
2. **브라우저 콘솔 확인**: ChatGPT 웹사이트의 개발자 도구에서 오류 확인
3. **MCP Inspector 테스트**: 로컬에서 먼저 정상 작동하는지 확인
4. **OpenAI 지원팀 문의**: [https://help.openai.com](https://help.openai.com)

