# Jian Unified System · Vue

Jian Unified System 的前端仓库，目前处于持续开发阶段。仓库包含账户中心 `apollo`、个人联系页 `contact`，以及仍在整理中的共享视觉资源 `core`。

## 仓库组成

| 目录 | 用途 | 当前状态 |
| --- | --- | --- |
| `apollo/` | 登录、注册、Passkey、第三方登录、个人信息与账户安全 | 主流程可构建；现有 DDD API 覆盖的账户操作已接入 |
| `contact/` | 多语言个人联系页、二维码卡片与 WebGL 背景 | 页面可构建，认证流程当前被停用 |
| `core/` | 视觉组件和公共 CSS 的候选共享区 | 尚未发布成包，和 `contact` 中存在副本漂移 |
| `docs/` | 产品、架构、接口、设计、测试、部署与安全文档 | 本仓库的工程文档入口 |

## 快速开始

要求 Node.js `^20.19.0` 或 `>=22.12.0`。当前两个应用各自维护依赖和锁文件，请在目标应用目录内执行命令。

```bash
cd apollo
npm install
npm run dev
```

```bash
cd contact
npm install
npm run dev
```

两个应用默认都使用 `20551` 端口，不能同时按默认配置启动。`apollo` 的本地 `/api` 请求由 Vite 转发到 `http://localhost:21100`。

## 设计与文档

- [工程文档索引](docs/README.md)
- [Figma UI 设计](https://www.figma.com/design/h6clqRhmtacmUpO8dixoXP/Jian-Unified-System?node-id=158-2490&p=f&m=dev)
- [登录页原型](https://www.figma.com/proto/h6clqRhmtacmUpO8dixoXP/Jian-Unified-System?page-id=147%3A2306&node-id=443-1420&p=f&viewport=-481%2C280%2C0.34&t=ecCHiLuE4jUfSf0h-1&scaling=contain&content-scaling=fixed&starting-point-node-id=443%3A1420)
- [用户页原型](https://www.figma.com/proto/h6clqRhmtacmUpO8dixoXP/Jian-Unified-System?page-id=158%3A2490&node-id=391-842&p=f&m=dev&scaling=scale-down&content-scaling=fixed&starting-point-node-id=391%3A842&show-proto-sidebar=1&t=UKBbrIDnm4fv1PUG-1)

当前完成度、已知缺口和推荐实施顺序见[实现状态与路线图](docs/STATUS.md)。
