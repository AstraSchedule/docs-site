> [!WARNING]
> 本页部分内容由 AI 生成，尚未经过人工审核，请谨慎参考。

# 系统架构

## 组件划分

- `AstraScheduleServerGo`：核心后端 API（Gin + GORM），支持 SQLite 和 MySQL
- `usr-dashboard`：Web 管理端（Vue3 + Naive UI + Vite），课表/调课/倒计时等配置管理
- `ElectronClassSchedule`：展示端客户端（Electron + 原生 HTML/CSS/JS）
- `dashboard`：数据库管理 Dashboard（Vue3 + Naive UI + Vite），面向运维人员的数据库操作界面
- `sys-backend`：系统后端（Go + Gin），管理多租户/数据库级操作，供 dashboard 调用
- `edge-gateway`：反向代理网关（Cloudflare Workers），路由 `*-do.getastra.cn` 子域名到对应租户后端
- `go-valence-cal`：调休计算能力（Go 库，通过 Go Modules 引入）
- `AstraScheduleDocs`：项目文档站（Rspress），即你正在阅读的文档

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
- `users`：管理员用户（用户名、密码哈希、角色、作用域）

## 多租户架构（SaaS 模式）

SaaS 版本通过 namespace 实现多租户数据隔离。namespace 从请求的 Host 头解析，规则为反转域名段用 `/` 连接（如 `aaa-do.getastra.cn` → `cn/getastra/aaa-do`）。所有数据表包含 `namespace` 字段作为唯一索引最高优先级。edge-gateway 负责路由 `*-do.getastra.cn` 子域名到对应租户后端。

> 注意：main 分支为基础版本，不含 namespace 多租户功能。SaaS 功能仅在 `saas/main` 分支。

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

用户偏好设置通过 electron-store 持久化保存在 `%APPDATA%/electron-class-schedule/config.json`，重装或更新后保持不变。

### localStorage

浏览器 localStorage 中保存运行时状态：

| 存储键 | 默认值 | 说明 |
|--------|--------|------|
| `weekIndex` | `0` | 当前周数 |
| `timeOffset` | `0` | 计时偏移秒数 |
| `dayOffset` | `-1` | 日程偏移（-1 表示使用当前日期） |
