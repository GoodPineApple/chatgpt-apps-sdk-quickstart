# EZDEGREE 커뮤니티 기능을 ChatGPT Apps SDK에 접목하기

## 개요

이 문서는 ezdegree의 커뮤니티 질문/답변 기능을 ChatGPT Apps SDK로 구현하는 방법을 설명합니다.

## EZDEGREE 커뮤니티 기능 분석

### 현재 기능

1. **질문(Question)**
   - 제목, 내용, 작성자, 생성일시
   - 좋아요/싫어요
   - 조회수
   - 답변 수
   - 질문 타입 (community/expert)
   - 정렬 옵션 (최신순, 미답변순, 활동순, 좋아요순)
   - 검색 기능

2. **답변(Answer)**
   - 질문에 대한 답변 내용
   - 작성자 (planner/user/student)
   - 좋아요/싫어요
   - 채택 여부
   - 점수 계산

3. **API 엔드포인트**
   - `GET /api/community/questions` - 질문 목록 조회
   - `POST /api/community/questions` - 질문 생성
   - `GET /api/community/questions/[id]` - 질문 상세 조회
   - `POST /api/community/answers` - 답변 생성
   - `GET /api/community/answers/[id]` - 답변 조회

## ChatGPT Apps SDK 구현 계획

### 1. MCP 서버 구조

#### Tools (도구)

1. **`search_questions`**
   - 질문 검색 및 목록 조회
   - 파라미터: query, sort, page, limit
   - 반환: 질문 목록 (structuredContent)

2. **`get_question_detail`**
   - 특정 질문 상세 정보 조회
   - 파라미터: questionId
   - 반환: 질문 상세 + 답변 목록

3. **`create_question`**
   - 새 질문 생성
   - 파라미터: title, content
   - 반환: 생성된 질문 정보

4. **`create_answer`**
   - 질문에 답변 작성
   - 파라미터: questionId, content
   - 반환: 생성된 답변 정보

5. **`like_question`** / **`dislike_question`**
   - 질문 좋아요/싫어요
   - 파라미터: questionId

6. **`like_answer`** / **`dislike_answer`**
   - 답변 좋아요/싫어요
   - 파라미터: answerId

#### Resources (UI 컴포넌트)

1. **`question-list-widget`**
   - 질문 목록을 표시하는 위젯
   - 검색, 정렬 기능 포함

2. **`question-detail-widget`**
   - 질문 상세 및 답변 목록을 표시하는 위젯
   - 답변 작성, 좋아요 기능 포함

### 2. 웹 컴포넌트 설계

#### question-list-widget.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>EZDegree 질문 목록</title>
  <style>
    /* 스타일링 */
  </style>
</head>
<body>
  <main>
    <h2>EZDegree 커뮤니티 질문</h2>
    
    <!-- 검색 및 정렬 -->
    <div class="controls">
      <input id="search-input" placeholder="질문 검색..." />
      <select id="sort-select">
        <option value="latest">최신순</option>
        <option value="unanswered">미답변순</option>
        <option value="active">활동순</option>
        <option value="mostLiked">좋아요순</option>
      </select>
      <button id="search-btn">검색</button>
    </div>

    <!-- 질문 목록 -->
    <ul id="question-list"></ul>

    <!-- 페이지네이션 -->
    <div id="pagination"></div>
  </main>

  <script type="module">
    // window.openai API를 사용하여 ChatGPT와 통신
    // 질문 목록 렌더링
    // 검색/정렬 기능 구현
  </script>
</body>
</html>
```

#### question-detail-widget.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>EZDegree 질문 상세</title>
</head>
<body>
  <main>
    <!-- 질문 정보 -->
    <article id="question-detail">
      <h2 id="question-title"></h2>
      <div id="question-meta">
        <span id="question-author"></span>
        <span id="question-date"></span>
        <span id="question-views">조회수: 0</span>
      </div>
      <div id="question-content"></div>
      <div id="question-actions">
        <button id="like-btn">👍 <span id="like-count">0</span></button>
        <button id="dislike-btn">👎 <span id="dislike-count">0</span></button>
      </div>
    </article>

    <!-- 답변 목록 -->
    <section id="answers-section">
      <h3>답변 <span id="answer-count">0</span>개</h3>
      <ul id="answer-list"></ul>
    </section>

    <!-- 답변 작성 폼 -->
    <form id="answer-form">
      <textarea id="answer-content" placeholder="답변을 작성해주세요..."></textarea>
      <button type="submit">답변 작성</button>
    </form>
  </main>

  <script type="module">
    // 질문 상세 정보 렌더링
    // 답변 목록 렌더링
    // 답변 작성 기능
    // 좋아요/싫어요 기능
  </script>
</body>
</html>
```

### 3. MCP 서버 구현 예시

```javascript
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import axios from "axios";

// ezdegree API 베이스 URL
const EZDEGREE_API_BASE = process.env.EZDEGREE_API_BASE || "http://localhost:3000/api";

const questionListHtml = readFileSync("public/question-list-widget.html", "utf8");
const questionDetailHtml = readFileSync("public/question-detail-widget.html", "utf8");

function createEzdegreeServer() {
  const server = new McpServer({ 
    name: "ezdegree-community", 
    version: "0.1.0" 
  });

  // 질문 목록 위젯 리소스 등록
  server.registerResource(
    "question-list-widget",
    "ui://widget/question-list.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/question-list.html",
          mimeType: "text/html+skybridge",
          text: questionListHtml,
          _meta: { "openai/widgetPrefersBorder": true },
        },
      ],
    })
  );

  // 질문 상세 위젯 리소스 등록
  server.registerResource(
    "question-detail-widget",
    "ui://widget/question-detail.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/question-detail.html",
          mimeType: "text/html+skybridge",
          text: questionDetailHtml,
          _meta: { "openai/widgetPrefersBorder": true },
        },
      ],
    })
  );

  // 질문 검색 도구
  server.registerTool(
    "search_questions",
    {
      title: "질문 검색",
      description: "EZDegree 커뮤니티에서 질문을 검색하고 목록을 조회합니다.",
      inputSchema: {
        query: z.string().optional(),
        sort: z.enum(["latest", "unanswered", "active", "mostLiked"]).optional(),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/question-list.html",
        "openai/toolInvocation/invoking": "질문을 검색하고 있습니다...",
        "openai/toolInvocation/invoked": "질문 목록을 불러왔습니다.",
      },
    },
    async (args) => {
      try {
        const params = new URLSearchParams();
        if (args?.query) params.append("query", args.query);
        if (args?.sort) params.append("sort", args.sort);
        if (args?.page) params.append("page", args.page.toString());
        if (args?.limit) params.append("limit", args.limit.toString());

        const response = await axios.get(
          `${EZDEGREE_API_BASE}/community/questions?${params}`
        );

        return {
          content: [
            {
              type: "text",
              text: `질문 ${response.data.questions.length}개를 찾았습니다.`,
            },
          ],
          structuredContent: {
            questions: response.data.questions,
            totalPages: response.data.totalPages,
            currentPage: response.data.currentPage || 1,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `질문 검색 중 오류가 발생했습니다: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // 질문 상세 조회 도구
  server.registerTool(
    "get_question_detail",
    {
      title: "질문 상세 조회",
      description: "특정 질문의 상세 정보와 답변 목록을 조회합니다.",
      inputSchema: {
        questionId: z.string().min(1),
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/question-detail.html",
        "openai/toolInvocation/invoking": "질문을 불러오고 있습니다...",
        "openai/toolInvocation/invoked": "질문 상세 정보를 불러왔습니다.",
      },
    },
    async (args) => {
      try {
        const questionResponse = await axios.get(
          `${EZDEGREE_API_BASE}/community/questions/${args.questionId}`
        );

        // 답변 목록도 함께 조회
        const answers = questionResponse.data.question.answers || [];
        const answerDetails = await Promise.all(
          answers.map((answerId) =>
            axios.get(`${EZDEGREE_API_BASE}/community/answers/${answerId}`)
          )
        );

        return {
          content: [
            {
              type: "text",
              text: `질문 "${questionResponse.data.question.title}"을 불러왔습니다.`,
            },
          ],
          structuredContent: {
            question: questionResponse.data.question,
            answers: answerDetails.map((res) => res.data.answer),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `질문 조회 중 오류가 발생했습니다: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // 질문 생성 도구
  server.registerTool(
    "create_question",
    {
      title: "질문 작성",
      description: "EZDegree 커뮤니티에 새 질문을 작성합니다.",
      inputSchema: {
        title: z.string().min(5).max(80),
        content: z.string().min(10).max(2000),
      },
      _meta: {
        "openai/toolInvocation/invoking": "질문을 작성하고 있습니다...",
        "openai/toolInvocation/invoked": "질문이 작성되었습니다.",
      },
    },
    async (args) => {
      try {
        // 인증 토큰이 필요한 경우 처리
        const token = args?.token; // ChatGPT에서 사용자 인증 정보 전달 필요
        
        const response = await axios.post(
          `${EZDEGREE_API_BASE}/community/questions`,
          {
            title: args.title,
            content: args.content,
            questionType: "community",
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `질문 "${args.title}"이 성공적으로 작성되었습니다.`,
            },
          ],
          structuredContent: {
            question: response.data.question,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `질문 작성 중 오류가 발생했습니다: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // 답변 생성 도구
  server.registerTool(
    "create_answer",
    {
      title: "답변 작성",
      description: "질문에 답변을 작성합니다.",
      inputSchema: {
        questionId: z.string().min(1),
        content: z.string().min(5).max(1000),
      },
      _meta: {
        "openai/toolInvocation/invoking": "답변을 작성하고 있습니다...",
        "openai/toolInvocation/invoked": "답변이 작성되었습니다.",
      },
    },
    async (args) => {
      try {
        const token = args?.token;
        
        const response = await axios.post(
          `${EZDEGREE_API_BASE}/community/answers`,
          {
            questionId: args.questionId,
            content: args.content,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        return {
          content: [
            {
              type: "text",
              text: "답변이 성공적으로 작성되었습니다.",
            },
          ],
          structuredContent: {
            answer: response.data.answer,
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `답변 작성 중 오류가 발생했습니다: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  return server;
}

// HTTP 서버 설정 (기존 todo 앱과 동일한 구조)
// ...
```

## 구현 단계

### 1단계: 기본 구조 설정
- [ ] MCP 서버 프로젝트 생성
- [ ] ezdegree API 연동 설정
- [ ] 기본 Tools 구현 (search_questions, get_question_detail)

### 2단계: UI 컴포넌트 개발
- [ ] question-list-widget.html 구현
- [ ] question-detail-widget.html 구현
- [ ] ChatGPT와의 상호작용 로직 구현

### 3단계: 고급 기능 추가
- [ ] 질문/답변 생성 기능
- [ ] 좋아요/싫어요 기능
- [ ] 인증 처리 (사용자 토큰 관리)

### 4단계: 테스트 및 배포
- [ ] 로컬 테스트
- [ ] ChatGPT 연결 테스트
- [ ] 프로덕션 배포

## 주요 고려사항

### 1. 인증 처리
- ChatGPT에서 사용자 인증 정보를 어떻게 전달할지 결정
- OAuth 또는 API 키 방식 고려
- 익명 사용자 지원 여부 결정

### 2. 데이터 동기화
- ChatGPT 내 위젯과 실제 서버 데이터 간 동기화
- 실시간 업데이트 필요 여부
- 캐싱 전략

### 3. 사용자 경험
- ChatGPT 대화 맥락 내에서 자연스러운 상호작용
- 프롬프트 최적화 (도구 설명, 메타데이터)
- 에러 처리 및 사용자 피드백

### 4. 보안
- API 엔드포인트 보호
- 사용자 입력 검증
- Rate limiting

## 예상 사용 시나리오

### 시나리오 1: 질문 검색
```
사용자: "학점 계산 관련 질문 찾아줘"
ChatGPT: search_questions 도구 호출 → 질문 목록 위젯 표시
```

### 시나리오 2: 질문 상세 조회
```
사용자: "첫 번째 질문 자세히 보여줘"
ChatGPT: get_question_detail 도구 호출 → 질문 상세 위젯 표시
```

### 시나리오 3: 질문 작성
```
사용자: "전공 선택에 대한 질문 올려줘"
ChatGPT: create_question 도구 호출 → 질문 생성 완료
```

### 시나리오 4: 답변 작성
```
사용자: "이 질문에 답변해줘"
ChatGPT: create_answer 도구 호출 → 답변 작성 완료
```

## 다음 단계

1. 퀵스타트 프로젝트를 실행하여 기본 동작 확인
2. ezdegree API 엔드포인트 테스트
3. MCP 서버에 첫 번째 도구 구현 (search_questions)
4. UI 컴포넌트 프로토타입 개발
5. ChatGPT에서 테스트 및 반복 개선

