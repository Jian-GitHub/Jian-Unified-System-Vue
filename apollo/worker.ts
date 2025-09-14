import type { ExecutionContext } from '@cloudflare/workers-types';

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api")) {
            // 新建 URL 避免 TypeScript readonly 报错
            const target = new URL(request.url);
            target.protocol = "http";         // 或 https
            target.hostname = "dev.jian.nz"; // Istio Gateway 域名
            target.port = "20550";
            target.pathname = target.pathname.replace(/^\/api/, "");
            // 如果有非标准端口，可以加 target.port = "9090";

            const headers = new Headers(request.headers);
            const cfIP = request.headers.get("CF-Connecting-IP");
            if (cfIP) {
                headers.set("X-Forwarded-For", cfIP);
                headers.set("X-Real-IP", cfIP);
            }
            // 可选：headers.set("Host", target.hostname);

            const newRequest = new Request(target.toString(), {
                method: request.method,
                headers,
                body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
                redirect: "follow",
            });

            return fetch(newRequest);
        }

        // Vue 静态文件
        return env.ASSETS.fetch(request);
    }
};