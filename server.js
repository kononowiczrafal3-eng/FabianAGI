import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./src/lib/env.js";
import { handleChat, handleCompact } from "./src/routes/chat.js";
import { handleAdmin, handleAdminLogin } from "./src/routes/admin.js";
import { handlePrivacy } from "./src/routes/privacy.js";
import { FABIAN_PERSONALITY } from "./src/lib/groq.js";

loadEnv();

const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(rootDir, "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function securityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' https: data: blob:; " +
      "connect-src 'self'; object-src 'none'; base-uri 'self'"
  );
}

function send404(res) {
  securityHeaders(res);
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(path.join(publicDir, "404.html")));
}

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, "");
  let filePath = path.join(publicDir, normalized);
  if (!filePath.startsWith(publicDir)) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) filePath = indexPath;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  return filePath;
}

function serveStatic(pathname, res) {
  const filePath = resolveFile(pathname);
  if (!filePath) {
    send404(res);
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": contentTypes[ext] || "application/octet-stream"
  };
  if (ext === ".html") {
    headers["Cache-Control"] = "no-cache";
  } else if (ext === ".js" || ext === ".css") {
    headers["Cache-Control"] = "public, max-age=86400";
  }
  securityHeaders(res);
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/api/persona" && req.method === "GET") {
      securityHeaders(res);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ name: "Fabian", personality: FABIAN_PERSONALITY }));
      return;
    }
    if (url.pathname === "/api/privacy" && req.method === "POST") {
      await handlePrivacy(req, res);
      return;
    }
    if (url.pathname === "/admin" && req.method === "GET") {
      await handleAdmin(req, res);
      return;
    }
    if (url.pathname === "/admin/login" && req.method === "POST") {
      await handleAdminLogin(req, res);
      return;
    }
    if (url.pathname === "/api/compact" && req.method === "POST") {
      await handleCompact(req, res);
      return;
    }
    if (url.pathname === "/api/chat" && req.method === "POST") {
      await handleChat(req, res);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      securityHeaders(res);
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Nie znaleziono zasobu." }));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      securityHeaders(res);
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Metoda niedozwolona." }));
      return;
    }
    serveStatic(url.pathname === "/" ? "/index.html" : url.pathname, res);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    if (!res.headersSent) {
      securityHeaders(res);
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    }
    res.end(JSON.stringify({ error: "Wewnętrzny błąd serwera." }));
  }
});

server.listen(port, () => {
  console.log(`FabianAGI działa na http://localhost:${port}`);
});
