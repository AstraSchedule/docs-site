# JWT（JSON Web Token）

## 通俗解释

JWT 就像一张身份证。登录成功后，服务器给你一张 token，里面写着你的身份信息。以后每次请求带上这个 token，服务器就知道你是谁，不用每次都重新登录。

AstraSchedule 管理端使用 JWT 认证，token 有效期 24 小时。

## 专业解释

JWT（JSON Web Token）是一种基于 JSON 的开放标准（RFC 7519），用于在网络应用间安全传输声明。

结构：三部分用 `.` 连接
- **Header**：算法和类型
- **Payload**：声明（用户信息、过期时间等）
- **Signature**：签名，防篡改

特点：
- **无状态**：服务器不保存会话，token 自包含所有信息
- **可扩展**：Payload 可添加自定义字段
- **跨域**：可用于不同域名间的认证

在 AstraSchedule 中：
- 签名算法：HS256
- 密钥：复用 `secret.token`
- 过期时间：24 小时
- 用途：管理端 API 认证
