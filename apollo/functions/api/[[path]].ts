import type { EventContext } from '@cloudflare/workers-types';

interface Env {
    API_BASE_URL?: string;
}

export const onRequest = async (
    context: EventContext<Env, any, Record<string, unknown>>
): Promise<Response> => {
    const { request, env } = context;
    const url = new URL(request.url);

    // const API_BASE_URL = env.API_BASE_URL || 'http://dev.jian.nz:30500';
    const API_BASE_URL = env.API_BASE_URL || 'http://apollo.osaka1.jianqi.jp:30500';
    const targetUrl = `${API_BASE_URL}${url.pathname.replace(/^\/api/, '')}${url.search}`;

    // OPTIONS 预检
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // 转换 Headers -> DOM HeadersInit 类型
    const headersInit: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headersInit[key] = value;
    });

    // 转换 body -> DOM BodyInit 类型
    let body: BodyInit | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
    }

    // 构造 RequestInit
    const reqInit: RequestInit = {
        method: request.method,
        headers: headersInit,
        body,
        redirect: 'follow',
    };

    try {
        // fetch 直接用 URL + RequestInit
        const response = await fetch(targetUrl, reqInit);

        // 克隆响应并添加 CORS
        const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });

        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newResponse.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With'
        );

        return newResponse;
    } catch (err) {
        console.error('Proxy error:', err);
        return new Response(
            JSON.stringify({
                error: 'Proxy error',
                message: err instanceof Error ? err.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
        );
    }
};