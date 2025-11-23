# ChatGPT 커넥터 설정 가이드

이 문서는 ChatGPT에 MCP 서버 커넥터를 추가하는 상세한 방법을 설명합니다.

## ⚠️ 중요 사전 확인 사항

### 1. ChatGPT Plus 구독 필요 여부
ChatGPT Apps SDK 기능은 현재 **ChatGPT Plus 구독자**에게만 제공될 수 있습니다. 무료 계정에서는 개발자 모드나 커넥터 옵션이 보이지 않을 수 있습니다.

### 2. 기능 가용성
ChatGPT Apps SDK는 **베타 기능**이므로, 모든 사용자에게 제공되지 않을 수 있습니다. OpenAI가 점진적으로 롤아웃하고 있을 수 있습니다.

### 3. 브라우저 및 계정
- 최신 Chrome, Edge, Safari 브라우저 사용 권장
- ChatGPT 웹 버전에서만 사용 가능 (앱 버전에서는 제한적)

---

## 방법 1: 표준 설정 경로 (일반적인 경우)

### 1단계: ChatGPT 웹사이트 접속

1. [https://chat.openai.com](https://chat.openai.com) 접속
2. 계정으로 로그인

### 2단계: 설정 메뉴 접근

**옵션 A: 왼쪽 사이드바에서**
1. 화면 왼쪽 하단의 **프로필 아이콘** (또는 사용자 이름) 클릭
2. 드롭다운 메뉴에서 **"Settings"** 또는 **"설정"** 클릭

**옵션 B: 오른쪽 상단에서**
1. 화면 오른쪽 상단의 **프로필 아이콘** 클릭
2. **"Settings"** 선택

### 3단계: 개발자 모드 활성화

설정 페이지에서 다음 중 하나를 찾아보세요:

**경로 A:**
1. **"Beta features"** 또는 **"베타 기능"** 탭 클릭
2. **"Developer mode"** 또는 **"개발자 모드"** 토글을 **ON**으로 설정

**경로 B:**
1. **"Apps & Connectors"** 또는 **"앱 및 커넥터"** 탭 클릭
2. **"Advanced settings"** 또는 **"고급 설정"** 클릭
3. **"Developer mode"** 토글을 **ON**으로 설정

**경로 C:**
1. 설정 페이지 하단의 **"Advanced"** 또는 **"고급"** 섹션 확인
2. **"Developer mode"** 옵션 찾기

### 4단계: Connectors 섹션 찾기

개발자 모드가 활성화되면 다음 중 하나의 경로로 접근:

**경로 A:**
1. 설정 페이지에서 **"Connectors"** 또는 **"커넥터"** 탭 클릭
2. 왼쪽 사이드바에 **"Connectors"** 메뉴가 나타날 수 있음

**경로 B:**
1. 설정 페이지에서 **"Apps & Connectors"** 탭 클릭
2. **"Connectors"** 섹션 확인

**경로 C:**
1. 채팅 화면 왼쪽 사이드바에서 **"Connectors"** 메뉴 직접 확인

### 5단계: 새 커넥터 생성

1. **"Create"**, **"Add connector"**, **"새 커넥터 추가"** 버튼 클릭

2. **커넥터 정보 입력:**
   - **Name (이름)**: 예) "Todo App", "My Todo App"
   - **Description (설명)**: 예) "간단한 할 일 관리 앱" (선택사항)
   - **URL**: 배포된 서버 URL + `/mcp`
     ```
     https://YOUR_PROJECT_ID.an.r.appspot.com/mcp
     ```
     또는
     ```
     https://chatgpt-apps-sdk-XXXXX-xx.a.run.app/mcp
     ```

3. **"Create"**, **"Save"**, **"저장"** 버튼 클릭

### 6단계: 커넥터 활성화 및 테스트

1. **새 채팅 시작**
   - 왼쪽 상단의 **"+"** 버튼 클릭
   - 또는 **"New chat"** 클릭

2. **커넥터 선택**
   - 채팅 입력창 위 또는 옆의 **"More"**, **"더보기"**, **"..."** 아이콘 클릭
   - 또는 채팅 화면 상단의 **커넥터 아이콘** 클릭
   - 생성한 커넥터 선택/활성화

3. **테스트 프롬프트 입력**
   ```
   Show my tasks
   ```
   또는
   ```
   할 일 목록 보여줘
   ```

---

## 방법 2: 대안 경로 (표준 경로가 없는 경우)

### 옵션 A: 채팅에서 직접 커넥터 추가

1. 새 채팅 시작
2. 채팅 입력창에 다음 프롬프트 입력:
   ```
   I want to add a custom connector. The MCP server URL is: https://YOUR_URL/mcp
   ```
3. ChatGPT가 커넥터 추가를 도와줄 수 있습니다

### 옵션 B: URL 직접 입력

일부 버전에서는 채팅에서 직접 URL을 입력하여 커넥터를 추가할 수 있습니다:

1. 채팅 시작
2. 다음 형식으로 입력:
   ```
   /connect https://YOUR_URL/mcp
   ```
   또는
   ```
   Add connector: https://YOUR_URL/mcp
   ```

---

## 문제 해결

### 문제 1: "Settings" 메뉴에 "Developer mode"가 보이지 않음

**가능한 원인:**
- ChatGPT Plus 구독이 필요할 수 있음
- 기능이 아직 계정에 롤아웃되지 않음
- 브라우저 캐시 문제

**해결 방법:**
1. **Plus 구독 확인**: [https://chat.openai.com/account/billing](https://chat.openai.com/account/billing)에서 구독 상태 확인
2. **브라우저 캐시 삭제**: 
   - Chrome: 설정 → 개인정보 및 보안 → 인터넷 사용 기록 삭제
   - 또는 시크릿 모드에서 테스트
3. **다른 브라우저 시도**: Chrome, Edge, Safari 등
4. **계정 재로그인**: 로그아웃 후 다시 로그인

### 문제 2: "Connectors" 섹션이 보이지 않음

**해결 방법:**
1. 개발자 모드가 활성화되었는지 다시 확인
2. 페이지 새로고침 (F5 또는 Cmd+R)
3. ChatGPT 웹사이트를 완전히 종료하고 다시 접속
4. 브라우저 확장 프로그램 비활성화 (특히 ChatGPT 관련 확장)

### 문제 3: 커넥터 추가 후 연결 실패

**확인 사항:**
1. **URL 형식 확인**:
   - ✅ 올바른 형식: `https://example.com/mcp`
   - ❌ 잘못된 형식: `http://example.com/mcp` (HTTPS 필수)
   - ❌ 잘못된 형식: `https://example.com` (`/mcp` 경로 누락)

2. **서버 상태 확인**:
   ```bash
   # 브라우저에서 직접 접속 테스트
   https://YOUR_URL/
   https://YOUR_URL/mcp
   ```

3. **CORS 설정 확인**: 서버가 CORS 헤더를 올바르게 반환하는지 확인

4. **서버 로그 확인**: 배포된 서버의 로그에서 요청이 도착하는지 확인

### 문제 4: "Feature not available" 오류

**원인:**
- ChatGPT Apps SDK가 아직 계정에 활성화되지 않음
- 지역 제한

**해결 방법:**
1. 몇 일 후 다시 시도 (점진적 롤아웃)
2. OpenAI 지원팀에 문의: [https://help.openai.com](https://help.openai.com)

---

## 스크린샷 가이드 (참고)

현재 ChatGPT UI는 자주 업데이트되므로, 정확한 위치는 다를 수 있습니다. 다음 위치들을 확인해보세요:

1. **설정 아이콘 위치:**
   - 왼쪽 하단: 프로필 아이콘
   - 오른쪽 상단: 사용자 메뉴

2. **설정 페이지 탭:**
   - General (일반)
   - Data controls (데이터 제어)
   - Beta features (베타 기능) ← 여기 확인
   - Apps & Connectors (앱 및 커넥터) ← 여기 확인

3. **커넥터 메뉴:**
   - 왼쪽 사이드바 하단
   - 채팅 화면 상단
   - 설정 페이지 내

---

## 공식 문서 및 지원

### OpenAI 공식 문서
- [ChatGPT Apps SDK 문서](https://developers.openai.com/apps-sdk)
- [Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart)

### 지원 요청
- [OpenAI 지원 센터](https://help.openai.com)
- [OpenAI 커뮤니티 포럼](https://community.openai.com)

---

## 대안: MCP Inspector로 먼저 테스트

ChatGPT에 연결하기 전에, 로컬에서 MCP 서버가 정상 작동하는지 확인:

```bash
# 서버 실행
npm start

# 다른 터미널에서 MCP Inspector 실행
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

MCP Inspector에서 정상 작동하면, 배포 후 ChatGPT 연결도 정상 작동할 가능성이 높습니다.

---

## 체크리스트

커넥터 추가 전 확인 사항:

- [ ] ChatGPT Plus 구독 확인
- [ ] 최신 브라우저 사용 (Chrome, Edge, Safari)
- [ ] 서버가 배포되어 있고 접근 가능한지 확인
- [ ] 배포된 URL이 HTTPS인지 확인
- [ ] URL에 `/mcp` 경로가 포함되어 있는지 확인
- [ ] 브라우저에서 배포된 URL 직접 접속 테스트
- [ ] 서버 로그에서 요청이 도착하는지 확인

---

## 추가 팁

1. **개발 중에는 ngrok 사용**: 빠른 테스트를 위해 ngrok을 사용하고, 안정화 후 Google Cloud에 배포
2. **로컬 테스트 우선**: ChatGPT 연결 전에 MCP Inspector로 로컬 테스트
3. **로그 모니터링**: 배포된 서버의 로그를 실시간으로 모니터링하여 문제 파악
4. **단계별 접근**: 한 번에 모든 기능을 구현하지 말고, 하나씩 테스트하며 진행

---

## 업데이트 정보

ChatGPT UI는 자주 변경되므로, 이 가이드가 정확하지 않을 수 있습니다. 최신 정보는 OpenAI 공식 문서를 참고하세요.

**마지막 업데이트**: 2025년 1월

