# ChatGPT Apps SDK 설정 가이드

이 문서는 ChatGPT Apps SDK 퀵스타트 프로젝트를 실행하고 ChatGPT에 연결하는 상세한 과정을 설명합니다.

## 목차

1. [ngrok이란?](#1-ngrok이란)
2. [ngrok 설치 방법](#2-ngrok-설치-방법)
3. [ngrok 사용 방법](#3-ngrok-사용-방법)
4. [ChatGPT에 커넥터 추가하기](#4-chatgpt에-커넥터-추가하기)
5. [테스트하기](#5-테스트하기)

---

## 1. ngrok이란?

**ngrok**은 로컬 컴퓨터에서 실행 중인 서버를 인터넷에 안전하게 노출시켜주는 터널링 도구입니다.

### 왜 필요한가요?

- ChatGPT는 인터넷을 통해 접근해야 하므로, 로컬에서만 실행되는 서버(`localhost:8787`)에는 직접 접근할 수 없습니다.
- ngrok을 사용하면 로컬 서버를 공개 URL(예: `https://abc123.ngrok.io`)로 변환하여 ChatGPT가 접근할 수 있게 됩니다.
- 개발 중인 앱을 외부에서 테스트하거나, 외부 서비스와 연동할 때 유용합니다.

### 동작 원리

```
로컬 서버 (localhost:8787)
    ↓
ngrok 터널
    ↓
공개 URL (https://abc123.ngrok.io)
    ↓
ChatGPT가 접근 가능
```

---

## 2. ngrok 설치 방법

### macOS에서 설치하기

#### 방법 1: Homebrew 사용 (권장)

1. **Homebrew가 설치되어 있는지 확인**:
   ```bash
   brew --version
   ```
   - Homebrew가 없다면 [Homebrew 공식 사이트](https://brew.sh)에서 설치하세요.

2. **ngrok 설치**:
   ```bash
   brew install --cask ngrok
   ```

3. **설치 확인**:
   ```bash
   ngrok version
   ```

#### 방법 2: 직접 다운로드

1. **ngrok 공식 웹사이트 방문**:
   - [https://ngrok.com/download](https://ngrok.com/download) 접속

2. **macOS 버전 다운로드**:
   - "macOS" 섹션에서 ZIP 파일 다운로드

3. **압축 해제 및 설치**:
   ```bash
   # 다운로드 폴더로 이동
   cd ~/Downloads
   
   # ZIP 파일 압축 해제
   unzip ngrok-stable-darwin-amd64.zip
   
   # 실행 파일을 시스템 PATH에 추가 (선택사항)
   sudo mv ngrok /usr/local/bin/
   
   # 또는 현재 디렉토리에서 직접 실행 가능
   ```

### ngrok 계정 생성 및 인증

1. **ngrok 계정 생성**:
   - [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)에서 무료 계정 생성

2. **인증 토큰 확인**:
   - 로그인 후 대시보드에서 **"Your Authtoken"** 섹션으로 이동
   - 또는 [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)에서 확인

3. **인증 토큰 설정**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
   - `YOUR_AUTH_TOKEN`을 대시보드에서 확인한 실제 토큰으로 교체하세요.

4. **인증 확인**:
   ```bash
   ngrok config check
   ```

---

## 3. ngrok 사용 방법

### 1단계: 로컬 서버 실행

먼저 ChatGPT Apps SDK 서버를 실행합니다:

```bash
cd chatgpt-apps-sdk-quickstart
npm install  # 처음 실행하는 경우
npm start
```

서버가 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
Todo MCP server listening on http://localhost:8787/mcp
```

### 2단계: ngrok 터널 시작

**새 터미널 창을 열고** 다음 명령어를 실행합니다:

```bash
ngrok http 8787
```

### 3단계: ngrok URL 확인

ngrok이 실행되면 다음과 같은 정보가 표시됩니다:

```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8787

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**중요한 정보**:
- **Forwarding URL**: `https://abc123def456.ngrok-free.app` (이 URL이 공개 URL입니다)
- **Web Interface**: `http://127.0.0.1:4040` (ngrok 요청 모니터링용)

### 4단계: 공개 URL 테스트

브라우저에서 다음 URL을 열어보세요:
```
https://abc123def456.ngrok-free.app
```

"Todo MCP server"라는 메시지가 표시되면 성공입니다!

### 5단계: MCP 엔드포인트 확인

MCP 엔드포인트도 테스트해보세요:
```
https://abc123def456.ngrok-free.app/mcp
```

### 주의사항

- **무료 계정 제한**: 무료 계정은 세션당 2시간 제한이 있으며, URL이 매번 변경됩니다.
- **ngrok 프로세스 유지**: ngrok을 실행한 터미널을 닫으면 터널이 종료됩니다. 별도 터미널에서 실행하거나 백그라운드로 실행하세요.
- **URL 변경**: ngrok을 재시작하면 새로운 URL이 생성됩니다. ChatGPT 커넥터도 업데이트해야 합니다.

---

## 4. ChatGPT에 커넥터 추가하기

### 1단계: ChatGPT 웹사이트 접속

1. [https://chat.openai.com](https://chat.openai.com) 접속
2. 계정으로 로그인

### 2단계: 설정 페이지로 이동

1. 화면 왼쪽 하단의 **프로필 아이콘** 클릭
2. 드롭다운 메뉴에서 **"Settings"** (설정) 클릭

### 3단계: 개발자 모드 활성화

1. 설정 페이지에서 **"Apps & Connectors"** (또는 "Beta features") 섹션 찾기
2. **"Advanced settings"** (고급 설정) 클릭
3. **"Developer mode"** (개발자 모드) 토글을 **ON**으로 설정

> **참고**: 개발자 모드가 보이지 않는다면, ChatGPT Plus 구독이 필요할 수 있습니다.

### 4단계: Connectors 섹션으로 이동

1. 설정 페이지에서 **"Connectors"** 섹션 찾기
2. 또는 왼쪽 메뉴에서 **"Connectors"** 클릭

### 5단계: 새 커넥터 생성

1. **"Create"** 또는 **"Add connector"** 버튼 클릭

2. **커넥터 정보 입력**:
   - **Name** (이름): 예) "Todo App" 또는 "My Todo App"
   - **Description** (설명): 예) "간단한 할 일 관리 앱"
   - **URL** (중요!): ngrok URL + `/mcp` 경로
     ```
     https://abc123def456.ngrok-free.app/mcp
     ```
     > **주의**: 반드시 `/mcp`를 URL 끝에 추가해야 합니다!

3. **"Create"** 또는 **"Save"** 버튼 클릭

### 6단계: 커넥터 확인

커넥터가 성공적으로 생성되면:
- Connectors 목록에 새로 추가된 커넥터가 표시됩니다
- 상태가 "Connected" 또는 "Active"로 표시되어야 합니다
- 문제가 있다면 "Refresh" 버튼을 클릭해보세요

---

## 5. 테스트하기

### 1단계: 새 채팅 시작

1. ChatGPT 메인 페이지로 돌아가기
2. 왼쪽 상단의 **"+"** 버튼 클릭하여 새 채팅 시작

### 2단계: 커넥터 추가

1. 채팅 화면에서 **"More"** (더보기) 메뉴 클릭
   - 또는 채팅 입력창 옆의 아이콘 클릭
2. **"Connectors"** 또는 **"Apps"** 섹션에서
3. 방금 생성한 커넥터 (예: "Todo App")를 **선택/활성화**

### 3단계: 첫 번째 요청 테스트

채팅 입력창에 다음 중 하나를 입력해보세요:

```
Show my tasks
```

또는

```
할 일 목록 보여줘
```

### 4단계: 결과 확인

성공하면:
- ChatGPT가 "Adding todo" 또는 "질문을 검색하고 있습니다..." 같은 메시지 표시
- 할 일 목록 위젯이 채팅 화면에 표시됨
- 빈 목록이거나 기존 할 일이 표시됨

### 5단계: 할 일 추가 테스트

```
Add a todo item "Learn ChatGPT Apps SDK"
```

또는

```
"ChatGPT Apps SDK 배우기" 할 일 추가해줘
```

### 문제 해결

**문제**: 커넥터가 연결되지 않음
- ngrok이 실행 중인지 확인
- URL에 `/mcp`가 포함되어 있는지 확인
- ngrok URL이 올바른지 확인 (브라우저에서 직접 접근 테스트)

**문제**: "Tool not found" 오류
- 서버가 실행 중인지 확인 (`npm start`)
- MCP 서버 로그 확인

**문제**: 위젯이 표시되지 않음
- 브라우저 개발자 도구(F12)에서 콘솔 오류 확인
- `window.openai` 객체가 존재하는지 확인

**문제**: ngrok URL이 변경됨
- ngrok을 재시작하면 URL이 변경됩니다
- ChatGPT 커넥터 설정에서 URL을 업데이트해야 합니다

---

## 추가 팁

### ngrok Web Interface 사용하기

ngrok을 실행하면 `http://127.0.0.1:4040`에서 웹 인터페이스를 제공합니다:
- 모든 HTTP 요청을 실시간으로 모니터링
- 요청/응답 내용 확인
- 디버깅에 유용

### ngrok을 백그라운드로 실행하기

```bash
# macOS/Linux
ngrok http 8787 > /dev/null 2>&1 &

# 또는 nohup 사용
nohup ngrok http 8787 &
```

### ngrok 고정 URL 사용하기 (유료)

무료 계정은 URL이 매번 변경되지만, 유료 계정을 사용하면 고정 URL을 사용할 수 있습니다.

---

## 다음 단계

이제 ChatGPT Apps SDK 퀵스타트가 완료되었습니다! 

- [EZDEGREE_INTEGRATION.md](./EZDEGREE_INTEGRATION.md)를 참고하여 ezdegree 서비스 연동을 시작하세요.
- [QUICKSTART_GUIDE.md](./QUICKSTART_GUIDE.md)에서 더 자세한 개념을 학습하세요.

