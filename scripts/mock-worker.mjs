// Offline stand-in for the real Cloudflare Worker (worker/src/index.js).
// Speaks the exact same wire contract the client expects — POST JSON in,
// streamed plain-text chunks out, §SRC:/§COACH§/§Q§ markers included — but
// never touches Groq or a real network. Used by `npm run mock` for manual
// dev poking and by scripts/screenshots.mjs to drive Playwright without
// spending the (fragile, free-tier) Groq quota.
import http from "node:http";
import { conversations, fallback } from "./conversations.mjs";

const HOST = "127.0.0.1";
const PORT = 8788;
const CHUNK_SIZE = 15;
const CHUNK_DELAY_MS = 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function pickReply(body) {
  const lang = conversations[body.lang] ? body.lang : "en";
  const mode = body.mode === "practice" ? "practice" : "represent";
  const userTurns = (body.messages || []).filter((m) => m.role === "user").length;
  const scenario = conversations[lang][mode];
  const turn = scenario[userTurns - 1];
  return turn ? turn.reply : fallback[lang][mode];
}

async function streamReply(res, text) {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "Access-Control-Allow-Origin": "*",
  });
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    res.write(text.slice(i, i + CHUNK_SIZE));
    await sleep(CHUNK_DELAY_MS);
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  const stamp = new Date().toISOString();

  if (req.method === "OPTIONS") {
    setCors(res);
    res.writeHead(204);
    res.end();
    console.log(`${stamp} OPTIONS ${req.url}`);
    return;
  }

  if (req.method !== "POST") {
    setCors(res);
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed");
    console.log(`${stamp} ${req.method} ${req.url} -> 405`);
    return;
  }

  try {
    const body = await readJsonBody(req);
    const reply = pickReply(body);
    const mode = body.mode === "practice" ? "practice" : "represent";
    const userTurns = (body.messages || []).filter((m) => m.role === "user").length;
    console.log(`${stamp} POST ${req.url} lang=${body.lang} mode=${mode} turn=${userTurns}`);
    await streamReply(res, reply);
  } catch (error) {
    console.error(`${stamp} error:`, error);
    setCors(res);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Mock worker error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Mock worker listening on http://${HOST}:${PORT}`);
});
