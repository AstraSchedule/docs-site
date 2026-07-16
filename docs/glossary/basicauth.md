# BasicAuth

## 通俗解释

BasicAuth 是最简单的认证方式。每次请求时带上用户名和密码，服务器验证后才处理。密码用 Base64 编码（不是加密），所以必须配合 HTTPS 使用。

AstraSchedule 当前使用 JWT 认证，不再使用 BasicAuth。JWT 登录通过 `/web/auth/login` 获取 Token，写操作需通过 `X-Verify-Password` 头传递密码进行二次确认。

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

在 AstraSchedule 中，BasicAuth 已被 JWT 取代：
- 当前认证方式：JWT（`Authorization: Bearer <token>`）
- 写操作确认：`X-Verify-Password` 头传递密码
