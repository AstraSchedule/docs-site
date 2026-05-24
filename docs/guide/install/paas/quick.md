> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

# PaaS 快速部署

假定你已熟悉域名、Cloudflare、阿里云函数计算和 Netlify 的基本操作。

## 准备

- 域名：`example.com`（已托管到 Cloudflare，开启代理）
- 阿里云函数计算 FC（自定义运行时，Go）
- Netlify（GitHub 仓库部署）
- 后端二进制：[GitHub Release](https://github.com/daizihan233/AstraScheduleServerGo/releases/latest)

## 步骤

### 1. Cloudflare DNS

```
api.example.com    CNAME → 函数计算地址    🟢 Proxied
admin.example.com  CNAME → Netlify 地址    🟢 Proxied
```

SSL/TLS → 完全（严格）。WAF → 已启用。

### 2. 函数计算

```yaml
运行时: custom.debian10
启动命令: ./astrago
环境变量: GIN_MODE=release
HTTP 触发器: 无需认证
```

上传 `astrago` 二进制 + `config.toml`。数据库建议用 SQLite（`db` 配置块留空即可，服务端自动用 SQLite）。

### 3. Netlify

Fork `daizihan233/AstraScheduleWeb` → 修改 `src/global.js`：

```js
export const APISRV = "https://api.example.com"
```

Netlify 导入 → Build command: `npm run build`，Publish directory: `dist`。

### 4. 客户端

[客户端安装指南](./client.md)，服务端地址填 `api.example.com`。

## 验证

```shell
curl https://api.example.com/web/menu
curl https://admin.example.com
```
