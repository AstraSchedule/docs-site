> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Sys Backend 系统后端

SaaS 版本的系统管理后端，供 Dashboard 调用，负责认证、租户管理、数据管理等系统级操作。

## 技术栈

- Go 1.26+ + Gin + GORM + JWT

## 项目结构

```
sys-backend/
├── main.go              # 入口
├── config/              # 配置加载
├── db/                  # 数据库操作
├── middleware/           # JWT 认证、权限验证
├── model/               # 数据模型
├── router/
│   ├── web/             # Web API 处理器
│   └── client/          # 客户端 API（预留）
├── service/             # 业务逻辑
└── startup/             # 启动初始化
```

## API 概览

所有接口前缀 `/web`，除 `/web/health`（健康检查，公开）外均需 JWT 认证。

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/web/auth/login` | 登录，获取 JWT Token |
| GET | `/web/auth/me` | 当前用户信息 |
| POST | `/web/auth/change-password` | 修改密码 |
| POST | `/web/auth/verify-password` | 验证密码（写操作二次确认） |

### 系统用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/system-users` | 列出所有系统用户 |
| POST | `/web/system-users` | 创建 |
| PUT | `/web/system-users/:id` | 更新 |
| DELETE | `/web/system-users/:id` | 删除 |

### 租户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/tenants` | 列出所有租户 |
| POST | `/web/tenants` | 创建租户（含阿里云 ESA DNS 配置） |
| DELETE | `/web/tenants/:id` | 删除租户 |
| POST | `/web/tenants/:id/ban` | 封禁租户 |
| POST | `/web/tenants/cleanup` | 清理租户数据 |
| POST | `/web/tenants/complete` | 完成租户配置 |
| POST | `/web/tenants/complete-dns` | 完成租户 DNS 配置 |

### 租户用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/web/astra-users` | 列出所有租户用户 |
| POST | `/web/astra-users` | 创建 |
| PUT | `/web/astra-users/:id` | 更新 |
| DELETE | `/web/astra-users/:id` | 删除 |

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

## 配置

```toml
[server]
host = "0.0.0.0"
port = 9001
domain = ["https://dashboard.example.com"]

[db]
# AstraScheduleServerGo（usr-backend）数据库配置
# type: mysql 或 sqlite
type = "sqlite"
path = "/data/astra/astra_schedule.db"

[sys_db]
# sys-backend 自有数据库配置
type = "sqlite"
path = "./data/sys_backend.db"

[astra]
# 对接的 usr-backend 服务
url = "http://localhost:9000"
token = "change_this_to_a_secure_token"
internal_secret = "change_this_to_match_astra_internal_secret"

[secret]
token = "change_this_to_a_secure_token"

[log]
debug = false

[esa]
# 租户 DNS 管理（阿里云 ESA，Cloudflare 已废弃）
# 建议使用只授予 esa 记录读写的最小权限 RAM 身份，不要用主账号 AK
access_key_id = ""
access_key_secret = ""
site_id = 0
site_name = "getastra.cn"
target = "astrasaas.origin-pool.getastra.cn"   # 回源必须指向「源地址池」（source_type=OP），避免自环
proxied = true
biz_name = "api"
source_type = "OP"
ttl = 1
endpoint = "esa.cn-hangzhou.aliyuncs.com"
tenant_comment = "SaaS"   # 租户记录备注标记，与 class/to/sys 等基础设施记录区分

[mtls]
# 调用 usr-backend 的出站 mTLS 客户端证书（留空不使用）
tls_cert = ""
tls_key = ""
tls_ca_cert = ""
```

> 完整配置请以 `sys-backend/config.template.toml` 为准。`[astra]` 段的 `internal_secret` 必须与 usr-backend 的 `internal.secret` 一致，`token` 用于系统端签发 JWT。
>
> 租户 DNS 由 Cloudflare 迁移到阿里云 ESA 后，函数计算的环境变量键名相应改为 `ASTRA_ESA_*` / `ASTRA_MTLS_*`（旧的 `ASTRA_CLOUDFLARE_*` 已失效）。

## 安全加固

- **登录失败限流**：`/web/auth/login` 按 IP + 用户名维度做内存限流，连续失败会被暂时拒绝，缓解暴力破解
- **租户创建**：`subdomain` 做格式校验（封堵 DNS 注入 / 通配符劫持）；`CompleteTenant` 创建的默认管理员带 `must_change_pwd`，首次登录强制改密
- **出站调用 usr-backend**：带 `User-Agent: AstraSchedule/System`（WAF 第一方标识），响应不是 `application/json` 时判为失败——WAF 质询页返回 `200 + text/html`，不能只看状态码
- **数据表操作**：`/web/data/*` 的表名来源收敛到白名单；删除单表依赖上述非 JSON 守卫，避免「数据没删、界面报成功」
- **SQLite**：`db` 与 `sys_db` 打开前检查库头，WAL 库自动转回 rollback journal，失败才拒绝启动（NFS 跨机共享场景，见[数据库维护](../administrator/maintenance)）

## 启动

```bash
go build -o sys-backend
./sys-backend
```

## 本地开发

1. 复制 `config.template.toml` 为 `config.toml`（TOML / YAML / JSON 任选其一，优先级见文件注释）
2. 初始化 `sys_db` 数据库（首次启动自动建表）
3. 填写 `[astra]` 段：`url` 指向本地 usr-backend 地址，`internal_secret` 与 usr-backend 的 `internal.secret` 保持一致
4. 启动 usr-backend 后再启动 sys-backend

```bash
go build ./...
go test ./...   # 运行测试
```

接口规范见仓库根目录 `SysBackend.openapi.json`，修改 API 时必须同步更新。
