import type { ExecutionContext } from '@cloudflare/workers-types';

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {

        // ---------- 新增：处理 OPTIONS 预检请求，避免 405 ----------
        if (request.method === "OPTIONS") {
            console.log(`[OPTIONS] ${request.url}`); // ---------- 新增日志 ----------
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        }

        const url = new URL(request.url);

        // ---------- 代理 /api 请求 ----------
        if (url.pathname.startsWith("/api")) {
            // ---------- 修改：新建 URL 避免 TS readonly 报错 ----------
            const target = new URL(request.url);

            // ---------- 修改：目标协议/主机/端口 ----------
            target.protocol = "http";               // 或 https
            target.hostname = "dev.jian.nz";       // Istio Gateway 域名
            target.port = "20550";                  // 非标准端口
            target.pathname = target.pathname.replace(/^\/api/, "");

            // ---------- 新增：Headers 保留 CF-Connecting-IP ----------
            const headers = new Headers(request.headers);
            const cfIP = request.headers.get("CF-Connecting-IP");
            if (cfIP) {
                headers.set("X-Forwarded-For", cfIP);
                headers.set("X-Real-IP", cfIP);
            }

            // ---------- 新增日志 ----------
            console.log(`[API Proxy] Method: ${request.method}, Path: ${url.pathname}, User IP: ${cfIP || "unknown"}`);

            // ---------- 确保 body 只有非 GET/HEAD 请求才传递 ----------
            const body = request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined;

            const newRequest = new Request(target.toString(), {
                method: request.method,
                headers,
                body,
                redirect: "follow",
            });

            return fetch(newRequest);
        }

        // ---------- 静态文件 ----------
        console.log(`[STATIC] ${url.pathname}`); // ---------- 新增日志 ----------
        return env.ASSETS.fetch(request);
    }
};