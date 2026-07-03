> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 开发文档

本文档面向参与 AstraSchedule 开发与维护的同学。

## 目录

- [系统架构](./architecture) — 组件划分、数据模型、多租户架构
- [Web 管理端 API](./api-web) — 管理端接口文档（JWT 认证、RBAC、备份等）
- [Go 后端实现约定](./backend-go) — 代码组织、认证鉴权、数据写入策略
- [Dashboard](./dashboard) — 数据库管理 Dashboard 开发文档
- [系统后端](./sys-backend) — sys-backend 开发文档
- [反向代理网关](./edge-gateway) — Cloudflare Workers 网关开发文档
- [调休计算库](./go-valence-cal) — go-valence-cal 库使用说明
- [文档维护（Rspress）](./docs-contrib) — 文档站开发与贡献指南

## 推荐阅读路径

1. 先看架构，明确模块边界
2. 再看 API 约定，避免前后端契约偏差
3. 最后看实现约定与文档规范
