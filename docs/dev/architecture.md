> [!WARNING]
>
> 本页由 AI 工具参考代码编写，部分内容未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 系统架构

## 组件划分

- `usr-backend`：核心后端 API（Gin + GORM），支持 SQLite 和 MySQL
- `usr-dashboard`：Web 管理端（Vue3 + Naive UI + Vite），课表/调课/倒计时等配置管理
- `desktop`：展示端客户端（Electron + 原生 HTML/CSS/JS）
- `sys-dashboard`：系统端 Dashboard（Vue3 + Naive UI + Vite），面向运维的多租户/数据管理界面
- `sys-backend`：系统后端（Go + Gin），管理多租户/数据库级操作，供 sys-dashboard 调用
- `reg-to` / `reg-go`：SaaS 注册中心（`reg-to` 为 Go 后端，`reg-go` 为 Vue3 前端），负责租户注册、子域名分配
- `go-valence-cal`：调休计算能力（Go 库，通过 Go Modules 引入）
- `docs-site`：项目文档站（Rspress），即你正在阅读的文档

## 数据作用域模型

数据按三级层次隔离：学校 → 年级 → 班级。

### 学校/年级级别

- `subjects`：科目简称与全称映射
- `timetables`：作息时间表

### 学校/年级/班级级别

- `schedules`：课表数据
- `client_configs`：客户端通用设置

### 班级级别

- `autorun_records`：自动任务记录（通过 `scope` 字段限定生效班级）
- `countdown_records`：倒数日数据（通过 `scope` 字段限定生效班级）
- `data_versions`：数据版本号
- `users`：管理员用户（`scope` 字段支持学校/年级/班级任意粒度，配合角色控制读写范围）

> 注：`autorun_records`、`countdown_records`、`users` 均通过 `scope` 字段限定生效范围，支持学校/年级/班级三级任意粒度，而非固定为某一级。

## 多租户架构（SaaS 模式）

SaaS 版本通过 namespace 实现多租户数据隔离。namespace 从请求的 Host 头解析，规则为反转域名段用 `/` 连接（如 `aaa-do.getastra.cn` → `cn/getastra/aaa-do`）。所有数据表包含 `namespace` 字段作为唯一索引最高优先级。SaaS 对外子域名与注册流程由 `reg-go` / `reg-to` 与线上网关共同完成。

> 注意：main 分支为基础版本，不含 namespace 多租户功能。SaaS 功能仅在 `saas/main` 分支（`sys-backend` / `sys-dashboard` 的 main 已含多租户能力）。

## 边缘缓存架构

高并发/低成本部署下，课表读路径前挂着一层**阿里云 ESA 边缘**（边缘函数 + KV），源站只在缓存未命中时被回源访问：

```
客户端 ──轮询(带版本号)──> ESA 边缘（WAF + 边缘函数 + KV）
                              │ 版本一致 → 304（客户端读本地缓存）
                              │ 版本不一致 / version=0 → 回源
                              ▼
                        函数计算源站 ──> SQLite（NFS 挂载盘）
```

- **KV 只存版本号**（1GB 容量限制，不存响应体），数据本体始终由源站提供
- **版本串格式**：`<数据最后变更时间戳>:<当前教学周>:<预测下一次更新时间>`，简称 `<t>:<w>:<e>`
- **304 判定**：源站只比对 `t` 与 `w`（第三段 `e` 忽略，客户端可不携带）；边缘同样忽略 `e`——两边口径必须一致，否则不同客户端手持的 `e` 差异会让边缘 KV 在多个版本号之间来回震荡、反复回源（即「缓存震荡」）
- **动态 TTL**：服务端一次解析**整周**课表（今天按真实时刻、后 6 天按各自零点），按天求值的自动任务缓存有效期可推到第 7 天末；cron 任务保留命中点，确保当天翻转时必然重取
- **写操作失效**：管理端/客户端的写路径在响应头声明 `X-Astra-Purge-Scopes: school/grade/class`（逗号分隔，年级/学校/`ALL` 作用域展开为班级粒度，上限 200 条），边缘据此删除对应 KV 键，实现「源站一写、边缘立失效」
- **强制回源**：客户端仅在用户点击托盘「更新课表」时携带 `version=0`，必定绕过边缘取最新数据；其余时机（启动、日程轮换、`SyncConfig` 推送、重连、重试）一律带版本号走协商
- **顺带迁到边缘的轻量能力**：网络连通检测（`GET /`）、天气代理——绝大多数请求不再触发函数计算
- **旧客户端门禁**：边缘对版本串语义过旧的客户端返回 `426 Upgrade Required`，要求升级后再接入

边缘排障（区分边缘响应与源站响应）见[运维手册 · WAF 与 CDN](../administrator/waf-cdn)。架构演进背景（纯本地 → C/S → Serverless → 边缘缓存）可参考维护者手记：[降本方法基础，组合方式就不基础](https://khbit.cn/posts/astra-edge/)。

## 关键链路

1. 管理端写配置 → 后端鉴权与校验 → 数据库 upsert
2. 客户端按作用域拉取配置 → 结合调休/自动任务计算当日课节
3. 自动任务按日期触发，动态覆写作息或课表

## 设计要点

- 后端兼容 Python 历史接口格式，降低前端改造成本
- 使用"常日"作为兜底作息，提升异常配置容错能力
- 针对 Serverless 场景优化冷启动行为

## 客户端存储

### electron-store

用户偏好设置通过 electron-store 持久化保存在 `%APPDATA%/electron_class_schedule/config.json`，重装或更新后保持不变。

### localStorage

浏览器 localStorage 中保存运行时状态：

| 存储键 | 默认值 | 说明 |
|--------|--------|------|
| `weekIndex` | `0` | 当前周数 |
| `timeOffset` | `0` | 计时偏移秒数 |
| `dayOffset` | `-1` | 日程偏移（-1 表示使用当前日期） |
