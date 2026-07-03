> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Sys-Backend 系统后端

Sys-Backend 是 AstraSchedule SaaS 版本的系统管理后端，提供认证、租户管理、数据管理等功能。该后端供 Dashboard 调用，负责系统级操作。

## 技术栈

- Go 1.26+
- Gin（HTTP 框架）
- GORM（ORM）
- JWT（认证）

## 项目结构

```
sys-backend/
├── main.go              # 入口文件
├── config/              # 配置加载
├── db/                  # 数据库连接与操作
├── middleware/           # 中间件（JWT 认证、权限验证）
├── model/               # 数据模型
├── router/              # 路由定义
│   ├── web/             # Web API 处理器
│   └── client/          # 客户端 API（预留）
├── service/             # 业务逻辑
└── startup/             # 启动初始化
```

## API 概览

所有接口前缀为 `/web`，使用 JWT 认证。

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/web/auth/login` | 用户登录，获取 JWT Token |
| GET | `/web/auth/me` | 获取当前用户信息 |
| POST | `/web/auth/change-password` | 修改密码 |
| POST | `/web/auth/verify-password` | 验证密码（写操作二次确认） |

### 系统用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/system-users` | 列出所有系统用户 |
| POST | `/web/system-users` | 创建系统用户 |
| PUT | `/web/system-users/:id` | 更新系统用户 |
| DELETE | `/web/system-users/:id` | 删除系统用户 |

### 租户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/tenants` | 列出所有租户 |
| POST | `/web/tenants` | 创建租户（含 Cloudflare DNS 配置） |
| DELETE | `/web/tenants/:id` | 删除租户 |
| POST | `/web/tenants/:id/ban` | 封禁租户 |
| POST | `/web/tenants/cleanup` | 清理租户数据 |
| POST | `/web/tenants/complete` | 完成租户配置 |
| POST | `/web/tenants/complete-dns` | 完成租户 DNS 配置 |

### 租户用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/astra-users` | 列出所有租户用户 |
| POST | `/web/astra-users` | 创建租户用户 |
| PUT | `/web/astra-users/:id` | 更新租户用户 |
| DELETE | `/web/astra-users/:id` | 删除租户用户 |

### 数据管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/data/tables` | 列出所有数据表 |
| GET | `/web/data/:table` | 列出表数据 |
| GET | `/web/data/:table/:id` | 获取单条记录 |
| POST | `/web/data/:table` | 创建记录 |
| PUT | `/web/data/:table/:id` | 更新记录 |
| DELETE | `/web/data/:table/:id` | 删除记录 |

### 备份与数据库

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/backup/export` | 导出备份 |
| POST | `/web/backup/import` | 导入备份 |
| POST | `/web/database/rebuild` | 重建数据库 |
| DELETE | `/web/database/drop/:table` | 删除单表 |
| POST | `/web/database/repair` | 修复数据库 |

## 认证机制

### JWT 认证

1. 调用 `POST /web/auth/login` 获取 JWT Token
2. 后续请求在 `Authorization` 头中携带 `Bearer <token>`
3. Token 有过期时间，过期后需重新登录

### 写操作二次确认

所有写操作（POST/PUT/DELETE）需要在 `X-Verify-Password` 头中提供密码进行二次确认。

## 配置

配置文件支持 TOML、YAML、JSON、dotenv 格式，环境变量前缀为 `SYS_`。

```toml
[server]
host = "0.0.0.0"
port = 9001
domain = ["https://dashboard.example.com"]

[db]
type = "sqlite"
path = "./data/sys.db"

[secret]
token = "your_secret"

[log]
debug = false
```

## 启动

```bash
# 构建
go build -o sys-backend

# 运行
./sys-backend
```
