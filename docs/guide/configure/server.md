# 服务端配置

本文描述服务端配置文件各项内容的含义

## 配置模板
配置模板随 CI 发布，您可以从 [Github Release](https://github.com/daizihan233/AstraScheduleServerGo/releases) 中下载对应版本的配置文件。

```toml
[apikey]
apihost = "YOURS.re.qweatherapi.com"  # 尚只接收和风天气 API
weather = "YOURS"      # 兜底 API Key：当 JWT 未完整填写时使用；若 JWT 与该项都未填写则天气接口返回 403

[apikey.jwt]
kid = ""               # JWT 凭据 ID（与 project_id、private_key_pem 同时填写才会启用 JWT）
project_id = ""        # JWT 项目 ID
private_key_pem = ""   # 支持完整 PEM 或单行 Base64(PKCS8 DER)
expires = 900           # JWT 有效期（秒），范围 1~86400

[secret]
token = "YOURS"

[server]
host = "0.0.0.0"
port = 9000
domain = ["https://manager.example.com", "http://localhost:5173"]  # 配置 CORS

[db]  # 目前，只支持 MySQL 及兼容 MySQL 的数据库
host = "YOURS"
port = 3306
user = "YOURS"
pass = "YOURS"  # 数据库密码
name = "YOURS"  # Database 名称

[log]
debug = false

[run]
serverless = true  # 是否使用 Serverless 模式；true=关闭 WebSocket，false=开启 WebSocket
```

## apikey

本项目通过调用并解析 [和风天气 API](https://dev.qweather.com/) 对外提供天气服务，有关注册与凭据申请，请参考 [和风天气 API 文档](https://dev.qweather.com/docs/configuration/project-and-key/)

### apihost

在 [和风天气 API 控制台](https://console.qweather.com/setting?lang=zh) 中，有一个名为 **API Host** 的字段，通常形如 `xxxx.re.qweatherapi.com`，请将其完整填写于此项

### weather

此空填写 API Key。在您创建凭据时，在 **身份验证方式** 中存在两个选项，分别是 **JSON Web Token** 和 **API KEY**。本空对应后者，即直接使用 **API Key** 的方式进行鉴权。当 JWT 相关字段未完整填写时，服务端会使用此项作为兜底 API Key；如果 JWT 与此项都未填写，则天气接口会返回 403 错误。

> [!WARNING]
> > API KEY的认证方式无法提供足够的安全性，因此我们计划从2027年1月1日起，[使用API KEY认证方式都将受请求量的限制](https://blog.qweather.com/announce/request-volume-limit-for-api-key/)。
> 我们推荐使用JSON Web Token (JWT)的认证方式获得更高等级的安全性以及不受限的API请求。
>
> 实际上，和风天气不建议这种认证方式，但是他足够方便。然而在 2027 年 2 月起，使用这种方式的请求会限制到 1000 次/天。您可以自行评估是否需要转用 JWT 认证方式

## apikey.jwt

这是推荐的认证方式，如果您同时填写两者，服务端会优先使用 JWT 进行鉴权。

您可以运行如下命令行（通常在 Linux 中）来生成 JWT 所需的密钥

```shell
openssl genpkey -algorithm ED25519 -out ed25519-private.pem && openssl pkey -pubout -in ed25519-private.pem > ed25519-public.pem
```

其他有关内容，请参考 [和风天气 API 文档](https://dev.qweather.com/docs/configuration/authentication/)，本文档中不再复述

### kid
凭据 ID，位于您申请的凭据详细信息里。

### project_id
项目 ID，位于您创建的项目详细信息里。

### private_key_pem
私钥 PEM，是您生成的 `ed25519-private.pem` 文件中的内容，它通常长成这个样子：

```text
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIP83EVkI2Jvtbs+GHg9ymuHiiyNe3renG+Az1ub4AW2W
-----END PRIVATE KEY-----
```

您可以直接将上述内容完整填写于此项，或者将其转换为单行 Base64 字符串（去掉首尾的 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`，以及中间的换行），两者均可被服务端正确解析。

示例：

```toml
private_key_pem = "MC4CAQAwBQYDK2VwBCIEIP83EVkI2Jvtbs+GHg9ymuHiiyNe3renG+Az1ub4AW2W"
```

### expires
JWT 有效期，单位为秒，范围为 1~86400（即 24 小时）。请根据需要进行调整，过短可能导致频繁请求新的 JWT，过长则可能增加安全风险。通常您不需要更改此项

## secret

### token
这是一个自定义的字符串，服务端会在收到敏感请求时验证它，以确保请求来自合法的客户端。您可以将其设置为一个随机且复杂的字符串，以增强安全性。请勿泄露此 token，否则可能导致未经授权的访问。

客户端、管理端中所提及的 “密码” 就是他。

## server

### host
服务端监听的主机地址，通常设置为 `0.0.0.0`，否则您无法从其它设备访问服务端。

### port
服务端监听的端口，默认为 `9000`，您可以根据需要进行调整，但请确保该端口未被其它应用占用。

### domain
配置允许访问服务端的域名列表，用于 CORS 验证。请将您的管理端地址（如 `https://manager.example.com`）添加到此列表中，以确保能够正常访问服务端接口。

## db

> [!TIP]
> 您可以使用任何与 MySQL 协议兼容的数据库或者云服务，这可以进一步压缩您的部署成本。

### host
数据库主机地址，通常是一个 IP 地址或域名。

### port
数据库端口，MySQL 默认是 `3306`。

### user
数据库用户名。

### pass
数据库密码。

### name
数据库名称。

> [!TIP]
> 服务端无法帮您创建数据库，您需要自行创建一个空的数据库。如果您使用的是云数据库或 Linux 管理面板，通常都有图形化的界面可以帮您创建数据库。

> [!NOTE]
> 
> 为什么服务端不能帮我创建数据库？
>
> 创建数据库需要更高的权限，通常不建议将最高权限授予应用程序。除此以外，数据库和数据表是两个独立的概念，数据表存于数据库中，服务端会在启动时自动创建必要的数据表，因此您只需要创建一个空的数据库即可。

## log
### debug
是否启用调试日志，默认为 `false`。启用后，服务端会输出更详细的日志信息，有助于开发和排查问题，但在生产环境中建议保持关闭以提升性能和安全性。

## run
### serverless
是否使用 Serverless 模式，默认为 `true`。启用后，服务端将关闭 WebSocket 功能，以适应无状态的 Serverless 环境；如果设置为 `false`，则会开启 WebSocket 功能，适用于传统的服务器部署。请根据您的部署环境选择合适的模式。

> [!NOTE]
> 
> 有关 Serverless 是什么，请参考 [术语表 - Serverless](../../terms.md#Serverless)
