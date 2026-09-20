import type { EventContext } from '@cloudflare/workers-types';

interface Env {
    API_BASE_URL?: string;
}

export const onRequest = async (
    context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response> => {
    const { request, env } = context;
    const url = new URL(request.url);

    const API_BASE_URL =
        env.API_BASE_URL || 'http://apollo.api.JianUnifiedSystem.com:31500';

    // /api/v1/auth/start -> /v1/auth/start
    const targetUrl =
        `${API_BASE_URL}${url.pathname.replace(/^\/api/, '')}${url.search}`;

    const headers = new Headers(request.headers);

    // 告诉后端，用户实际访问的是哪个公网地址
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    // 不建议把 Cloudflare 的 Host 直接发给源站
    headers.delete('host');

    let body: BodyInit | undefined;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = request.body;
    }

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,

            // 非常重要：
            // 后端 302 必须返回给浏览器，不能让 Worker 自己跟随
            redirect: 'manual',
        });

        // 原样返回上游响应
        // 包括：
        // Location
        // Set-Cookie
        // Content-Type
        // Status Code
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (err) {
        console.error('Proxy error:', err);

        return new Response(
            JSON.stringify({
                error: 'Proxy error',
                message: err instanceof Error ? err.message : 'Unknown error',
            }),
            {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store',
                },
            }
        );
    }
};