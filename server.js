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
  
  // 요청 본문 수집 (POST 요청용)
  let requestBody = "";
  if (req.method === "POST" || req.method === "PUT") {
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });
  }

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

  // Health check (GET /)
  if (req.method === "GET" && url.pathname === "/") {
    logRequest();
    console.log(`[${requestId}] Health check request`);
    res.writeHead(200, { 
      "content-type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    }).end("Todo MCP server");
    const latency = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Health check completed (${latency}ms)`);
    return;
  }

  // MCP 엔드포인트 처리 (루트 경로와 /mcp 경로 모두 처리)
  const isMcpEndpoint = url.pathname === MCP_PATH || 
                       (url.pathname === "/" && req.method === "POST");
  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  
  if (isMcpEndpoint && req.method && MCP_METHODS.has(req.method)) {
    logRequest();
    
    // POST 요청의 경우 본문을 기다림
    if (req.method === "POST") {
      await new Promise((resolve) => {
        req.on("end", resolve);
      });
      if (requestBody) {
        console.log(`[${requestId}] Request body:`, requestBody);
        try {
          const parsed = JSON.parse(requestBody);
          console.log(`[${requestId}] Parsed JSON:`, JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(`[${requestId}] Body is not JSON`);
        }
      }
    }
    
    console.log(`[${requestId}] Processing MCP request`);
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    res.setHeader("Content-Type", "application/json");

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

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
      // 매 요청마다 transport에 연결 (stateless 모드)
      console.log(`[${requestId}] Connecting MCP server to transport...`);
      await mcpServer.connect(transport);
      console.log(`[${requestId}] MCP server connected, handling request...`);
      await transport.handleRequest(req, res);
      console.log(`[${requestId}] Request handled successfully`);
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error(`[${requestId}] ❌ Error handling MCP request (${latency}ms):`, error);
      console.error(`[${requestId}] Error stack:`, error.stack);
      console.error(`[${requestId}] Request URL:`, req.url);
      console.error(`[${requestId}] Request Method:`, req.method);
      console.error(`[${requestId}] Request Headers:`, JSON.stringify(req.headers, null, 2));
      if (requestBody) {
        console.error(`[${requestId}] Request Body:`, requestBody);
      }
      
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

