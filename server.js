import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const todoHtml = readFileSync("public/todo-widget.html", "utf8");

const addTodoInputSchema = {
  title: z.string().min(1),
};

const completeTodoInputSchema = {
  id: z.string().min(1),
};

let todos = [];
let nextId = 1;

const replyWithTodos = (message) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { tasks: todos },
});

function createTodoServer() {
  const server = new McpServer({ name: "todo-app", version: "0.1.0" });

  server.registerResource(
    "todo-widget",
    "ui://widget/todo.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/todo.html",
          mimeType: "text/html+skybridge",
          text: todoHtml,
          _meta: { "openai/widgetPrefersBorder": true },
        },
      ],
    })
  );

  server.registerTool(
    "add_todo",
    {
      title: "Add todo",
      description: "Creates a todo item with the given title.",
      inputSchema: addTodoInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/todo.html",
        "openai/toolInvocation/invoking": "Adding todo",
        "openai/toolInvocation/invoked": "Added todo",
      },
    },
    async (args) => {
      const title = args?.title?.trim?.() ?? "";
      if (!title) return replyWithTodos("Missing title.");
      const todo = { id: `todo-${nextId++}`, title, completed: false };
      todos = [...todos, todo];
      return replyWithTodos(`Added "${todo.title}".`);
    }
  );

  server.registerTool(
    "complete_todo",
    {
      title: "Complete todo",
      description: "Marks a todo as done by id.",
      inputSchema: completeTodoInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/todo.html",
        "openai/toolInvocation/invoking": "Completing todo",
        "openai/toolInvocation/invoked": "Completed todo",
      },
    },
    async (args) => {
      const id = args?.id;
      if (!id) return replyWithTodos("Missing todo id.");
      const todo = todos.find((task) => task.id === id);
      if (!todo) {
        return replyWithTodos(`Todo ${id} was not found.`);
      }

      todos = todos.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      );

      return replyWithTodos(`Completed "${todo.title}".`);
    }
  );

  return server;
}

// Google App Engine과 Cloud Run은 PORT 환경 변수를 자동으로 설정합니다
const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

// MCP 서버를 전역으로 생성 (매 요청마다 새로 만들지 않음)
const mcpServer = createTodoServer();

const httpServer = createServer(async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // 요청 정보 로깅
  const logRequest = () => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const isChatGPT = userAgent.includes("openai-mcp") || userAgent.includes("ChatGPT");
    const requestType = isChatGPT ? "🤖 ChatGPT" : "🌐 Web Browser";
    
    console.log(`[${requestId}] ${requestType} - ${req.method} ${req.url}`);
    console.log(`[${requestId}] User-Agent: ${userAgent}`);
    console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
  };

  if (!req.url) {
    console.error(`[${requestId}] Missing URL`);
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  // CORS preflight 처리
  if (req.method === "OPTIONS") {
    logRequest();
    console.log(`[${requestId}] CORS preflight request`);
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id, authorization",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  // Health check (GET /, HEAD /)
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/") {
    logRequest();
    console.log(`[${requestId}] Health check request (${req.method})`);
    res.writeHead(200, { 
      "content-type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    });
    if (req.method === "GET") {
      res.end("Todo MCP server");
    } else {
      res.end(); // HEAD 요청은 본문 없이 헤더만
    }
    const latency = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Health check completed (${latency}ms)`);
    return;
  }

  // MCP 엔드포인트 처리 (루트 경로와 /mcp 경로 모두 처리)
  const isMcpEndpoint = url.pathname === MCP_PATH || 
                       (url.pathname === "/" && (req.method === "POST" || req.method === "HEAD"));
  const MCP_METHODS = new Set(["POST", "GET", "DELETE", "HEAD"]);
  
  if (isMcpEndpoint && req.method && MCP_METHODS.has(req.method)) {
    logRequest();
    console.log(`[${requestId}] Processing MCP request`);
    
    // Accept 헤더 확인하여 응답 형식 결정
    const acceptHeader = req.headers["accept"] || "";
    const wantsSSE = acceptHeader.includes("text/event-stream");
    const wantsJSON = acceptHeader.includes("application/json") || !wantsSSE;
    
    console.log(`[${requestId}] Accept header: ${acceptHeader}`);
    console.log(`[${requestId}] Wants SSE: ${wantsSSE}, Wants JSON: ${wantsJSON}`);
    
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    
    // Content-Type은 transport가 설정하도록 하거나, SSE인 경우 명시적으로 설정
    if (wantsSSE) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    // StreamableHTTPServerTransport 생성
    // stateless 모드에서는 매 요청마다 새 transport를 생성해야 함
    // enableJsonResponse는 SSE를 원할 때는 false로 설정
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: wantsJSON, // SSE를 원하면 false
    });
    
    console.log(`[${requestId}] Transport created with enableJsonResponse: ${wantsJSON}`);

    // 연결 종료 시 정리
    res.on("close", () => {
      try {
        transport.close();
        const latency = Date.now() - startTime;
        console.log(`[${requestId}] Connection closed (${latency}ms)`);
      } catch (error) {
        console.error(`[${requestId}] Error closing transport:`, error);
      }
    });

    // 응답 완료 시 로깅
    const originalEnd = res.end;
    res.end = function(...args) {
      const latency = Date.now() - startTime;
      console.log(`[${requestId}] ✅ Response sent (${latency}ms, status: ${res.statusCode})`);
      return originalEnd.apply(this, args);
    };

    try {
      // HEAD 요청은 간단히 응답만 보내고 종료
      if (req.method === "HEAD") {
        console.log(`[${requestId}] HEAD request - sending headers only`);
        res.writeHead(200, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "Mcp-Session-Id",
          "Content-Type": "application/json",
        });
        res.end();
        console.log(`[${requestId}] ✅ HEAD request completed`);
        return;
      }

      // MCP 서버를 transport에 연결
      // stateless 모드에서는 매 요청마다 connect해야 하지만, 서버 인스턴스는 재사용
      console.log(`[${requestId}] Connecting MCP server to transport...`);
      await mcpServer.connect(transport);
      console.log(`[${requestId}] MCP server connected, handling request...`);
      
      // transport.handleRequest가 req 스트림을 직접 읽도록 함
      // 요청 본문은 transport가 처리하므로 여기서 읽지 않음
      // 중요: req 스트림은 한 번만 읽을 수 있으므로, 미리 읽으면 안 됨
      console.log(`[${requestId}] Calling transport.handleRequest...`);
      console.log(`[${requestId}] Request readable: ${req.readable}, destroyed: ${req.destroyed}`);
      
      try {
        await transport.handleRequest(req, res);
        console.log(`[${requestId}] Request handled successfully`);
      } catch (handleError) {
        console.error(`[${requestId}] Error in transport.handleRequest:`, handleError);
        console.error(`[${requestId}] Error details:`, {
          message: handleError.message,
          stack: handleError.stack,
          name: handleError.name,
        });
        throw handleError; // 상위 catch로 전달
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error(`[${requestId}] ❌ Error handling MCP request (${latency}ms):`, error);
      console.error(`[${requestId}] Error stack:`, error.stack);
      console.error(`[${requestId}] Request URL:`, req.url);
      console.error(`[${requestId}] Request Method:`, req.method);
      console.error(`[${requestId}] Request Headers:`, JSON.stringify(req.headers, null, 2));
      
      if (!res.headersSent) {
        res.writeHead(500, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }).end(JSON.stringify({
          error: "Internal server error",
          message: error.message,
          requestId: requestId,
        }));
      }
    }
    return;
  }

  // 404 처리
  logRequest();
  console.log(`[${requestId}] ❌ 404 - Path not found: ${url.pathname}`);
  res.writeHead(404, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }).end(JSON.stringify({ 
    error: "Not Found",
    path: url.pathname,
    requestId: requestId,
  }));
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(
    `Todo MCP server listening on http://0.0.0.0:${port}${MCP_PATH}`
  );
  console.log(`Health check: http://0.0.0.0:${port}/`);
});

// 에러 핸들링
httpServer.on("error", (error) => {
  console.error("HTTP Server Error:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

