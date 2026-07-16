> [!DANGER]
> 本文档由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Edge Gateway 边缘网关

运行在 Cloudflare Workers 上的边缘 API 网关，路由 `*-do.getastra.cn` 子域名到对应租户后端。

## 技术栈

- TypeScript + Bun + Cloudflare Workers

## 项目结构

```
edge-gateway/
├── package.json
├── wrangler.jsonc
├── tsconfig.json
└── src/
    └── index.ts         # Worker 入口
```

## 功能

### 路由转发

根据请求 Host 头路由到对应租户后端：

- `aaa-do.getastra.cn` → 租户 AAA 的后端

### 命名空间解析

反转域名段用 `/` 连接：`aaa-do.getastra.cn` → `cn/getastra/aaa-do`

## 开发

```bash
bun install
bun run dev       # 本地开发
bun run deploy    # 部署到 Cloudflare Workers
```

## 限制

- 免费版有每日请求限制
- 不支持 WebSocket
