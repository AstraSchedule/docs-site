> [!DANGER] 
>
> 本文档由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：[kuohu@getastra.cn](mailto:kuohu@getastra.cn)

# 开发文档

本文档面向参与 AstraSchedule 开发与维护的同学。

## 按项目分类

| 项目 | 说明 |
|------|------|
| [Desktop 客户端](./desktop/) | Electron 客户端，课表展示与插件系统 |
| [User Backend](./usr-backend/) | Go 后端 API，课表数据与规则引擎 |
| [User Dashboard](./usr-dashboard) | Vue3 用户管理后台 |
| [Sys Backend](./sys-backend) | Go 系统后端，SaaS 租户管理 |
| [Sys Dashboard](./sys-dashboard) | Vue3 系统管理面板 |
| [Go-Valence-Cal](./go-valence-cal) | 调休计算库 |
| [Edge Gateway](./edge-gateway) | Cloudflare Workers 边缘网关 |
| [文档贡献](./docs-contrib) | Rspress 文档站开发与编写规范 |

## 跨项目文档

| 文档 | 说明 |
|------|------|
| [系统架构](./architecture) | 组件划分、数据模型、多租户架构 |

## 推荐阅读路径

1. 先看架构，明确模块边界
2. 再看你负责的项目文档
3. API 约定见 [User Backend](./usr-backend/api-web)
