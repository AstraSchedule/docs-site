> [!WARNING]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 服务端配置

本页详细说明 AstraScheduleServerGo 后端的所有配置项、配置文件格式、环境变量覆盖方式及优先级规则。

## 配置文件格式

后端支持以下配置文件格式，按优先级从高到低依次尝试加载：

| 优先级 | 格式 | 文件名示例 | 说明 |
|--------|------|-----------|------|
| 1 | 环境变量 | — | 最高优先级，覆盖所有文件配置 |
| 2 | TOML | `config.toml` | 推荐格式，支持注释 |
| 3 | YAML | `config.yaml` / `config.yml` | 适合自动化工具生成 |
| 4 | JSON | `config.json` | 通用格式 |
| 5 | dotenv | `.env` | 适合容器化部署 |

> 💡 启动时后端会按上述顺序查找文件，**找到第一个即停止**。例如存在 `config.toml` 和 `config.yaml` 时，只加载 `config.toml`。

## 环境变量

所有配置项均可通过环境变量覆盖。环境变量前缀为 `ASTRA_`，使用下划线分隔层级：

```bash
# 示例：覆盖服务端口
ASTRA_SERVER_PORT=9100

# 示例：覆盖数据库类型
ASTRA_DB_TYPE=sqlite

# 示例：配置 CORS 域名（逗号分隔）
ASTRA_SERVER_DOMAIN="https://example.com,http://localhost:5173"
```

### 环境变量映射表

| 环境变量 | 对应配置项 | 类型 | 示例值 |
|----------|-----------|------|--------|
| `ASTRA_APIKEY_WEATHER` | `apikey.weather` | string | `ed8ad218...` |
| `ASTRA_APIKEY_APIHOST` | `apikey.apihost` | string | `qu7qqnuwvp.re.qweatherapi.com` |
| `ASTRA_APIKEY_JWT_KID` | `apikey.jwt.kid` | string | `CMGTQDB4YV` |
| `ASTRA_APIKEY_JWT_PROJECT_ID` | `apikey.jwt.project_id` | string | `49TNEK5VBV` |
| `ASTRA_APIKEY_JWT_PRIVATE_KEY_PEM` | `apikey.jwt.private_key_pem` | string | `MC4CAQAw...` |
| `ASTRA_APIKEY_JWT_EXPIRES` | `apikey.jwt.expires` | int | `900` |
| `ASTRA_SECRET_TOKEN` | `secret.token` | string | `your_secret` |
| `ASTRA_SERVER_HOST` | `server.host` | string | `0.0.0.0` |
| `ASTRA_SERVER_PORT` | `server.port` | int | `9000` |
| `ASTRA_SERVER_DOMAIN` | `server.domain` | string (逗号分隔) | `https://example.com` |
| `ASTRA_DB_TYPE` | `db.type` | string | `mysql` 或 `sqlite` |
| `ASTRA_DB_HOST` | `db.host` | string | `localhost` |
| `ASTRA_DB_PORT` | `db.port` | int | `3306` |
| `ASTRA_DB_USER` | `db.user` | string | `root` |
| `ASTRA_DB_PASS` | `db.pass` | string | `password` |
| `ASTRA_DB_NAME` | `db.name` | string | `astraschedule` |
| `ASTRA_DB_PATH` | `db.path` | string | `./data/astra_schedule.db` |
| `ASTRA_LOG_DEBUG` | `log.debug` | bool | `true` |
| `ASTRA_RUN_SERVERLESS` | `run.serverless` | bool | `true` |

## 配置文件详解

以下是完整的 TOML 配置文件示例（`config.toml`）：

```toml
[apikey]
# 和风天气 API 配置
apihost = "qu7qqnuwvp.re.qweatherapi.com"  # API 域名（从和风天气控制台获取）
weather = "YOUR_API_KEY"                     # 兜底 API Key

[apikey.jwt]
# 和风天气 JWT 认证（优先于 API Key）
kid = ""                # JWT 凭据 ID
project_id = ""         # JWT 项目 ID
private_key_pem = ""    # Ed25519 私钥（PEM 或 Base64 单行）
expires = 900           # JWT 有效期（秒），范围 1~86400

[secret]
# 服务认证密钥
token = "YOUR_SECRET"   # 用于 Basic Auth 和 JWT 签名

[server]
host = "0.0.0.0"        # 监听地址
port = 9000             # 监听端口
domain = [              # CORS 允许的域名列表
  "https://manager.example.com",
  "http://localhost:5173"
]

[db]
type = "mysql"          # 数据库类型：mysql 或 sqlite

# MySQL 配置（type=mysql 时使用）
host = "localhost"
port = 3306
user = "root"
pass = "password"
name = "astraschedule"

# SQLite 配置（type=sqlite 时使用）
path = "./data/astra_schedule.db"

[log]
debug = false           # 调试模式（true 时日志级别为 Trace）

[run]
serverless = true       # Serverless 模式（true=禁用 WebSocket）
```

## 各配置项说明

### `[apikey]` — 天气 API

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `apihost` | string | 是 | — | 和风天气 API 域名，从控制台获取 |
| `weather` | string | 否 | — | 兜底 API Key，当 JWT 未配置时使用 |

#### `[apikey.jwt]` — JWT 认证

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `kid` | string | 否 | — | JWT 凭据 ID |
| `project_id` | string | 否 | — | JWT 项目 ID |
| `private_key_pem` | string | 否 | — | Ed25519 私钥，支持 PEM 格式或 Base64 单行 |
| `expires` | int | 否 | `900` | JWT 有效期（秒），范围 1~86400 |

> 💡 `kid`、`project_id`、`private_key_pem` 三项**同时填写**才会启用 JWT 认证，否则回退到 `apikey.weather`。

### `[secret]` — 服务密钥

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `token` | string | 是 | — | 用于 Basic Auth 和 JWT 签名的密钥 |

> ⚠️ 此密钥同时用于：
> 1. 客户端/管理端的 Basic Auth 认证
> 2. JWT 令牌的签名密钥
>
> 请妥善保管，**不要提交到公开仓库**。

### `[server]` — 服务器配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `host` | string | 否 | `0.0.0.0` | 监听地址 |
| `port` | int | 否 | `9000` | 监听端口 |
| `domain` | []string | 否 | `[]` | CORS 允许的域名列表 |

> ⚠️ Windows 系统端口 9000-9099 可能被 Hyper-V 预留，如遇绑定失败请更换端口（如 9100）。

### `[db]` — 数据库配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 否 | `mysql` | 数据库类型：`mysql` 或 `sqlite` |
| `host` | string | MySQL 必填 | — | MySQL 主机地址 |
| `port` | int | MySQL 必填 | `3306` | MySQL 端口 |
| `user` | string | MySQL 必填 | — | MySQL 用户名 |
| `pass` | string | MySQL 必填 | — | MySQL 密码 |
| `name` | string | MySQL 必填 | — | MySQL 数据库名 |
| `path` | string | SQLite 必填 | — | SQLite 数据库文件路径 |

### `[log]` — 日志配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `debug` | bool | 否 | `false` | 调试模式，开启后日志级别为 Trace |

### `[run]` — 运行模式

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `serverless` | bool | 否 | `false` | Serverless 模式，开启后禁用 WebSocket |

## 部署示例

### 本地开发（SQLite）

```bash
# 方式一：config.toml
cat > config.toml << 'EOF'
[apikey]
apihost = "qu7qqnuwvp.re.qweatherapi.com"
weather = "your_key"

[secret]
token = "dev_secret"

[server]
host = "0.0.0.0"
port = 9000
domain = ["http://localhost:5173"]

[db]
type = "sqlite"
path = "./data/dev.db"

[log]
debug = true

[run]
serverless = false
EOF
```

### 函数计算（环境变量）

```bash
export ASTRA_APIKEY_APIHOST="qu7qqnuwvp.re.qweatherapi.com"
export ASTRA_APIKEY_WEATHER="your_key"
export ASTRA_SECRET_TOKEN="your_secret"
export ASTRA_SERVER_PORT=9000
export ASTRA_SERVER_DOMAIN="https://your-domain.com"
export ASTRA_DB_TYPE="mysql"
export ASTRA_DB_HOST="rm-xxx.mysql.rds.aliyuncs.com"
export ASTRA_DB_PORT=3306
export ASTRA_DB_USER="admin"
export ASTRA_DB_PASS="your_password"
export ASTRA_DB_NAME="astraschedule"
export ASTRA_RUN_SERVERLESS="true"
```

### Docker（.env 文件）

```bash
# .env 文件内容
ASTRA_APIKEY_APIHOST=qu7qqnuwvp.re.qweatherapi.com
ASTRA_APIKEY_WEATHER=your_key
ASTRA_SECRET_TOKEN=your_secret
ASTRA_SERVER_PORT=9000
ASTRA_SERVER_DOMAIN=https://your-domain.com
ASTRA_DB_TYPE=sqlite
ASTRA_DB_PATH=/data/astra_schedule.db
ASTRA_RUN_SERVERLESS=true
```
