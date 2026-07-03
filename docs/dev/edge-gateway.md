> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Edge Gateway 边缘网关

Edge Gateway 是运行在 Cloudflare Workers 上的边缘 API 网关，用于路由 `*-do.getastra.cn` 子域名到对应租户后端。

## 技术栈

- Bun（包管理）
- Cloudflare Workers
- TypeScript

## 项目结构

```
edge-gateway/
├── package.json         # 依赖配置
├── wrangler.jsonc       # Wrangler 配置
├── tsconfig.json        # TypeScript 配置
└── src/
    └── index.ts         # Worker 入口
```

## 功能

### 路由转发

Edge Gateway 根据请求的 Host 头，将请求路由到对应的租户后端：

- `aaa-do.getastra.cn` → 租户 AAA 的后端
- `bbb-do.getastra.cn` → 租户 BBB 的后端

### 命名空间解析

从域名解析命名空间，规则为反转域名段用 `/` 连接：

```
aaa-do.getastra.cn → cn/getastra/aaa-do
```

## 开发

```bash
# 安装依赖
bun install

# 本地开发
bun run dev

# 部署到 Cloudflare Workers
bun run deploy
```

## 配置

Wrangler 配置在 `wrangler.jsonc` 中：

```jsonc
{
  "name": "edge-gateway",
  "main": "src/index.ts",
  "compatibility_date": "2024-11-06"
}
```

## 部署

1. 登录 Cloudflare 账号
2. 配置 `wrangler.toml` 或使用环境变量
3. 运行 `bun run deploy`

## 限制

- Cloudflare Workers 免费版有每日请求限制
- 不支持 WebSocket（如需 WebSocket，需使用其他方案）
- 冷启动可能有延迟
