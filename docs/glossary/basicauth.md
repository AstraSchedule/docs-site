# BasicAuth

## 通俗解释

BasicAuth 是最简单的认证方式。每次请求时带上用户名和密码，服务器验证后才处理。密码用 Base64 编码（不是加密），所以必须配合 HTTPS 使用。

AstraSchedule 兼容旧版客户端使用 BasicAuth，用户名是 `ElectronClassSchedule` 或 `AstraSchedule`，密码在 `config.toml` 中配置。

## 专业解释

BasicAuth（HTTP 基本认证）是 HTTP 协议规定的认证机制，定义在 RFC 7617。

工作流程：
1. 客户端在请求头中添加 `Authorization: Basic <base64(username:password)>`
2. 服务器解码并验证用户名密码
3. 验证通过处理请求，失败返回 401

特点：
- **简单**：无需额外库支持
- **无状态**：每次请求都带凭证
- **不安全**：Base64 可逆，必须 HTTPS

在 AstraSchedule 中：
- 用户名：`ElectronClassSchedule`（旧版）或 `AstraSchedule`
- 密码：`config.toml` 中的 `secret.token`
- 用途：兼容旧版客户端、写操作密码确认
