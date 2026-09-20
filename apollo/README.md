# Apollo

Jian Unified System 的统一账户前端，包含登录/注册、Turnstile、Passkey、第三方登录以及个人资料和账户安全页。项目仍在开发中，功能完成度见 [`../docs/STATUS.md`](../docs/STATUS.md)。

```bash
npm install
npm run dev
```

开发服务器默认监听 `20551`，并将 `/api` 请求转发到 `http://localhost:21100`。生产构建使用：

```bash
npm run build
```

页面右上角和账户页顶部提供 Hephaestus 入口，开发环境默认跳转到当前主机的 `15173` 端口。部署到其他来源时设置 `VITE_HEPHAESTUS_URL`。

进一步阅读：

- [`../docs/DEVELOPMENT.md`](../docs/DEVELOPMENT.md)
- [`../docs/API.md`](../docs/API.md)
- [`../docs/DESIGN.md`](../docs/DESIGN.md)
- [`../docs/SECURITY.md`](../docs/SECURITY.md)

## Hephaestus SSO

`/authorize` 是 Apollo 的子系统授权确认页。登录、注册、Passkey 或第三方登录后，
短期待处理授权可返回此页；确认后调用 Apollo DDD 的 `/v1/sso/authorize`。
只有后端验证过的精确回跳地址才能收到一次性授权码。

默认前端端口 `20551`，`/api` 代理 Apollo API `21100`。隔离验证可通过
`APOLLO_API_TARGET` 指定另一个本地 API。实际数据库以 Apollo DDD RPC 的
`etc/apollorpc.yaml` 为准，使用本地 3306。

用户中心退出调用 `/v1/sso/logout`，由 Apollo 使账户会话版本失效。
新端点属于 `apollo-api-ddd` / `apollo-rpc-ddd`，不会出现在保留的旧实现中。
