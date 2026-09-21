> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 注册中心运维

SaaS 模式下，用户通过注册页自助开通租户。本页说明注册中心的组成、配置项与多 DNS 服务商的接法。

## 组成

| 组件 | 仓库 | 职责 |
|------|------|------|
| 注册页 | `reg-go` | Vue3 + Vite 前端，收集子域名、管理员账户、学校信息 |
| 注册服务 | `reg-to` | Go + Gin，人机验证、签发注册令牌、写入 DNS 记录 |

注册服务部署在阿里云函数计算（FC）上，注册页是纯静态站点。

## 注册流程

```text
浏览器                 reg-to                    usr-backend
   │                     │                          │
   │─ 1. POST /api/sign-token ─▶│                   │
   │    （Turnstile 令牌）       │                   │
   │◀──── 注册 JWT（10 分钟）────│                   │
   │                     │                          │
   │─ 2. POST /web/admin/register-tenant ──────────▶│
   │    （X-Reg-Token: 注册 JWT）                    │  创建租户与管理员
   │◀───────────────────── 200 ─────────────────────│
   │                     │                          │
   │─ 3. POST /api/create-dns ─▶│                   │
   │    （注册 JWT）             │  向各 DNS 服务商写记录
   │◀──── urls / providers ─────│                   │
```

第 2、3 步都是**幂等**的：任一步失败后重新提交同一流程，不会产生重复租户或重复解析记录。用户可以直接在确认页再次点击「确认注册」重试。

> [!NOTE]
> 管理员口令以 **AES-256-GCM 密文**放在注册 JWT 的 `enc_password` 字段里，Astra 后端解密后使用。JWT 只是 Base64 编码而非加密，因此明文口令不会出现在令牌中。

## 注册页环境变量（reg-go）

构建时通过 `.env` 注入，只有 `VITE_` 前缀的变量会进入前端产物。

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE` | 注册服务地址，如 `https://to.getastra.cn` |
| `VITE_ASTRA_API_BASE` | Astra 后端地址，如 `https://class.getastra.cn` |
| `VITE_TURNSTILE_SITEKEY` | Cloudflare Turnstile 站点密钥 |

> [!WARNING]
> 生产构建必须显式设置 `VITE_API_BASE`。留空时请求会打到同源地址，注册流程无法完成。

## 注册服务环境变量（reg-to）

完整清单见仓库内的 `env.example.sh`。核心项：

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | | 监听端口，默认 `9002` |
| `GIN_MODE` | | 值为 `release` 时进入生产模式，其它值视为开发模式 |
| `TURNSTILE_SECRET_KEY` | ✅ 生产 | Turnstile 服务端密钥，缺失时注册类接口直接拒绝 |
| `ASTRA_API_BASE` | ✅ | Astra 后端地址 |
| `ASTRA_API_SECRET` | ✅ | 与 Astra 后端 `config.toml` 的 `[internal] secret` **必须一致**；同时用于 JWT 签名与口令加密密钥派生 |
| `TLS_CERT` / `TLS_KEY` | | 调用 Astra 后端的 mTLS 客户端证书，支持文件路径或 PEM 文本 |
| `REQUIRE_MTLS` | | 设为 `true` 时缺少证书将拒绝启动 |
| `DNS_PROVIDERS` | | 启用的 DNS 服务商名单，见下节 |
| `RESERVED_SUBDOMAINS` | | 禁止注册的保留名，逗号分隔；留空使用内置名单 |
| `TRUSTED_PROXIES` | | 可信反向代理网段，用于解析客户端真实 IP |
| `CORS_ALLOWED_ORIGINS` | | 跨域来源白名单；留空表示允许任意来源（不携带凭证） |

> [!IMPORTANT]
> `ASTRA_API_SECRET` 与后端 `[internal] secret` 不一致时，注册令牌无法通过校验，注册流程会在第 2 步失败。

## 多 DNS 服务商

一次注册会向**全部已启用的服务商**写入解析记录，各服务商并发执行、独立上报结果。

### 支持的服务商

| 标识 | 服务 | 写入内容 |
|------|------|----------|
| `cloudflare` | Cloudflare DNS | `<子域名>.<CF_ZONE_NAME>` 的 CNAME，可开启橙云代理 |
| `alidns` | 阿里云云解析 | `<子域名>.<ALI_DNS_DOMAIN>` 的 CNAME，支持按线路写多条 |
| `esa` | 阿里云 ESA | ESA 站点内的 CNAME 记录，可开启代理加速 |

### 启用规则

在 `DNS_PROVIDERS` 中按优先级顺序列出，例如：

```bash
export DNS_PROVIDERS="alidns,cloudflare"
```

- **顺序即优先级**：第一个「对外暴露且写入成功」的域名作为主访问地址。
- **没有列进来的服务商完全不会被触碰**。这是有意不支持某家服务的正确做法，例如 ESA 使用泛域名加速时，只需在 ESA 控制台配置一次 `*.getastra.cn`，不需要每个租户注册都调用 ESA API，那就不要把 `esa` 写进名单。
- 留空 `DNS_PROVIDERS` 时自动探测：哪个服务商配置齐全就启用哪个。
- **显式列出但配置不全**的服务商不会静默跳过，而是以 `skipped` 结果上报缺失的配置项，便于发现遗漏。

### 幂等写入

写入前先查询，再决定动作：

| `action` | 含义 |
|----------|------|
| `created` | 记录不存在，本次新建 |
| `updated` | 记录已存在但内容不一致，本次更新 |
| `unchanged` | 记录已存在且内容一致，未做改动 |

因此重复提交注册请求是安全的，不会产生重复记录，也不会因为「记录已存在」而报错。

### `{sub}` 占位符

所有目标地址都支持 `{sub}`，会在注册时替换为实际子域名。用于按子域名派生的回源目标：

```bash
export ALI_DNS_TARGET_OVERSEAS="{sub}.cf.getastra.cn"
```

注册 `nj39` 时展开为 `nj39.cf.getastra.cn`。

### 对外暴露开关

每个服务商都有一个 `<服务商>_PUBLIC` 开关（默认 `true`），控制它写出的域名是否作为**对用户可见的访问地址**返回。

| 值 | 行为 |
|----|------|
| `true` | 记录照常写入，域名出现在注册结果的 `urls` 里 |
| `false` | 记录照常写入，但域名不会展示给用户 |

若所有服务商都是 `false`，会回退为展示全部成功域名，避免出现「写入成功却拿不到地址」的情况。

## 常见架构

### 架构一：ESA NS 接入（推荐）

把域名的 NS 指向阿里云 ESA，DNS 与加速/防护都由 ESA 承担：

```text
用户 ──▶ school.getastra.cn ──▶ ESA（权威 DNS + 加速/防护）──▶ 源站
```

```bash
export DNS_PROVIDERS="esa"

export ALI_ESA_SITE_ID="<站点 ID>"
export ALI_ESA_SITE_NAME="getastra.cn"
export ALI_ESA_TARGET="<源地址池名称>"
export ALI_ESA_PROXIED="true"
export ALI_ESA_BIZ_NAME="api"
export ALI_ESA_SOURCE_TYPE="OP"
export ALI_ESA_PUBLIC="true"
```

> [!DANGER]
> **回源必须指向「源地址池」，不能指向站点内的域名。**
>
> ESA 与 Cloudflare 的 CNAME 拉平逻辑不同：开启代理加速时，ESA 会把回源目标解析成实际 IP 再回源。如果目标落在本站点自己的域名空间内（例如把回源写成 `class.getastra.cn`，而它同样由本 ESA 站点代理），ESA 会解析到自己的边缘节点，**形成自环**。
>
> 源地址池（`ALI_ESA_SOURCE_TYPE=OP`）不走 DNS 解析，因此没有这个问题。服务启动时若检测到「开启代理 + 回源类型非 `OP` + 目标落在站点域名空间内」会打印自环警告。

`ALI_ESA_BIZ_NAME` 是**按记录**生效的业务场景标签：租户域名 `school.getastra.cn` 承载客户端 API 调用，填 `api`；管理后台 `i.getastra.cn` 是网页，手工配置时应填 `web` —— 两者用错会影响 ESA 的缓存与优化策略。

租户记录由本服务创建；`class`（后端）、`i`（管理后台）、`to`（注册站）等**非租户记录需要在 ESA 控制台手动配置**。

> [!DANGER]
> **务必先建齐记录、再切换 NS。** NS 一旦指向 ESA，ESA 就是该域名的唯一权威 DNS，任何缺失的记录都会直接解析失败，届时整站不可用。
>
> 建议顺序：① ESA 控制台完成 NS 接入（若接入方式变更，`ALI_ESA_SITE_ID` 可能随之变化）→ ② 配好全部非租户记录 → ③ 配置 `DNS_PROVIDERS="esa"` → ④ 迁移存量租户记录 → ⑤ 核对记录齐全 → ⑥ 最后切换 NS。

存量租户记录需要从旧 DNS 服务商搬迁过来，本服务目前**不提供跨服务商搬迁命令**，需要手工导出/重建，或让租户重新提交一次注册流程。

### 架构二：Cloudflare 做 DNS，CNAME 指向 ESA

DNS 交给 Cloudflare，加速与防护交给阿里云 ESA：

```text
用户 ──▶ school.getastra.cn ──CNAME──▶ ESA 接入域名 ──▶ 源站
         （Cloudflare 解析）              （ESA 加速/防护）
```

```bash
export DNS_PROVIDERS="cloudflare"

export CF_ZONE_NAME="getastra.cn"
export CF_TARGET="<ESA 给出的接入域名>"
export CF_PROXIED="false"
export CF_PUBLIC="true"
```

要点：

- `CF_PROXIED` 必须设为 `false`（灰云）。开启橙云会变成「CF 边缘 → ESA → 源站」两层代理，反而拖累 ESA 的国内加速效果。
- `CF_PROXIED=false` 时 Cloudflare 规定 `ttl=1`（自动）无效，必须给 60~86400 的具体秒数。若 `CF_TTL` 仍沿用默认的 `1`，本服务会自动按 600 秒写入，并在启动日志中提示。
- 已有租户的记录不会自动改指。改 `CF_TARGET` 后需要用下面的维护模式批量迁移。

### 架构三：云解析智能分流

需要按线路区分国内外访问时，可以让阿里云云解析承担分流：

```text
                      ┌── 境外线路 ──▶ school.cf.getastra.cn ──▶ Cloudflare ──▶ 源站
用户 ──▶ 云解析 ──────┤
                      └── 默认线路 ──▶ ESA 接入地址 ─────────▶ ESA ────────▶ 源站
```

```bash
export DNS_PROVIDERS="alidns,cloudflare"

# 阿里云云解析：默认线路指国内，境外线路指 Cloudflare 侧域名
export ALI_DNS_DOMAIN="getastra.cn"
export ALI_DNS_TARGET="<ESA 给出的接入 CNAME>"
export ALI_DNS_TARGET_OVERSEAS="{sub}.cf.getastra.cn"
export ALI_DNS_LINE="default"
export ALI_DNS_LINE_OVERSEAS="overseas"
export ALI_DNS_PUBLIC="true"

# Cloudflare：只作为境外线路的回源目标，不作为访问地址展示
export CF_ZONE_NAME="cf.getastra.cn"
export CF_TARGET="class.getastra.cn"
export CF_PROXIED="true"
export CF_PUBLIC="false"
```

此时租户拿到的地址只有 `https://nj39.getastra.cn`，而 `nj39.cf.getastra.cn` 只作为分流目标存在，不会出现在注册结果里。

ESA 若已在控制台配置泛域名加速，则**不需要**列入 `DNS_PROVIDERS`。

> [!NOTE]
> 云解析侧的目标地址是固定值还是按子域名变化，取决于 ESA 的接入方式：整站 CNAME 接入时填固定的 ESA 接入地址；需要为每个子域名单独指定时用 `{sub}` 模板。

### 迁移存量记录

切换回源目标（例如从源站改到 ESA 接入域名）之后，已有租户的记录仍指向旧目标。用维护模式批量改指：

```bash
# 1. 先预览，默认不写入任何改动
reg-to -sync-dns -from class.getastra.cn

# 2. 确认输出无误后执行
reg-to -sync-dns -from class.getastra.cn -apply
```

行为约定：

| 项 | 说明 |
|----|------|
| 默认行为 | 只预览，必须显式加 `-apply` 才写入 |
| 改哪些记录 | 只改内容**恰好等于** `-from` 的记录，其它记录一律不动 |
| 改成什么 | 各服务商自身配置的目标（`CF_TARGET` / `ALI_DNS_TARGET` / `ALI_ESA_TARGET`），支持 `{sub}` |
| 支持范围 | 目前只有 `cloudflare` 支持批量改指；其它服务商会以「不支持批量改指」上报 |
| 退出码 | `0` 成功，`1` 有服务商出错，`2` 参数不全 |

> [!WARNING]
> 这是批量生产 DNS 变更。执行前请先导出当前 DNS 记录作为备份，并先用默认的预览模式确认改动范围。

> [!NOTE]
> 本命令只在**同一个服务商内**改目标值，不用于跨服务商搬迁记录。从 Cloudflare 迁到 ESA NS 接入时，存量租户记录需要另行导出/重建或让租户重新注册。
>
> 支持批量改指的服务商：`cloudflare`、`esa`。ESA 侧会连同目标值、TTL、代理开关、回源类型与业务场景一起写回，因此也可以用它把存量记录从 `Domain` 迁到 `OP`。

## 结果与排错

`/api/create-dns` 与 `/api/register` 返回：

```json
{
  "status": "success",
  "message": "注册成功",
  "url": "https://nj39.getastra.cn",
  "urls": ["https://nj39.getastra.cn"],
  "providers": [
    {
      "provider": "alidns",
      "label": "阿里云云解析",
      "enabled": true,
      "ok": true,
      "public": true,
      "fqdn": "nj39.getastra.cn",
      "records": [
        { "fqdn": "nj39.getastra.cn", "line": "default", "action": "created" },
        { "fqdn": "nj39.getastra.cn", "line": "overseas", "action": "created" }
      ]
    }
  ]
}
```

状态码含义：

| 状态码 | 含义 |
|--------|------|
| `200` | 全部成功，或部分服务商失败（此时 `warnings` 非空） |
| `502` | 全部已启用服务商都写入失败 |
| `503` | 未配置任何可用的 DNS 服务商 |

常见情况：

- **子域名检查提示「暂时不可用，请稍后重试」**：任一服务商或 Astra 后端校验失败时会按「不可用」返回（fail-closed），避免用户走完流程才发现记录建不出来。稍后重试即可。
- **提示服务商被 `skipped`**：该服务商列在 `DNS_PROVIDERS` 里但配置不全，`reason` 字段会列出缺失的变量名。
- **注册成功但 `warnings` 非空**：已成功写入的服务商不受影响，失败的那家可在修复配置后重新提交同一注册流程补写。

## 安全注意事项

- 生产环境必须配置 `TURNSTILE_SECRET_KEY`。缺失时注册类接口会**直接拒绝**而不是跳过验证。
- `env.sh` / `config.toml` 含有 Cloudflare API Token、mTLS 私钥、内部共享密钥等敏感信息，**禁止提交到仓库**。
- 子域名默认屏蔽了一批保留名（`www`、`api`、`admin`、`i`、`to`、`class` 等），避免抢占既有服务或引发钓鱼风险。可用 `RESERVED_SUBDOMAINS` 覆盖。
- 建议在函数计算网关或反向代理层为注册接口增加速率限制。

## 升级注意

注册令牌中口令字段格式从明文 `password` 改为密文 `enc_password`，两侧需要**先升级 Astra 后端、再升级注册服务**：

1. 先发布 `usr-backend`：它同时支持密文与旧版明文令牌。
2. 再发布 `reg-to`：此后只签发密文。

反向顺序会出现旧后端读不到口令、创建出空密码管理员的情况。
