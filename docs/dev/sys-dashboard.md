> [!DANGER] 
>
> 本文档由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：[kuohu@getastra.cn](mailto:kuohu@getastra.cn)

# Sys Dashboard 系统管理面板

SaaS 版本的管理面板，面向运维人员，提供系统用户管理、租户管理、数据浏览编辑等功能。

## 技术栈

- Vue3 + Vite + Naive UI
- vue-router、vue-request

## 项目结构

```
sys-dashboard/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── auth.js          # 认证逻辑
    ├── global.js        # API 地址配置
    ├── api/             # API 封装
    ├── components/      # 公共组件
    ├── router/
    ├── utils/
    └── views/
        ├── Login.vue
        ├── Home.vue
        ├── SystemUsers.vue
        ├── Tenants.vue
        ├── TenantUsers.vue
        ├── Data.vue
        ├── DataTable.vue
        ├── Tools.vue
        ├── ChangePassword.vue
        └── Layout.vue
```

## 主要页面

| 页面 | 功能 |
|------|------|
| 登录 | 用户名密码登录，JWT Token 管理 |
| 首页 | 系统概览、快捷操作 |
| 系统用户管理 | 创建/编辑/删除系统用户，角色管理 |
| 租户管理 | 创建租户（含 Cloudflare DNS 配置）、封禁、清理 |
| 租户用户管理 | 创建/编辑/删除租户用户 |
| 数据浏览 | 查看/编辑/删除数据记录 |
| 工具 | 数据库重建、单表删除、修复、备份导入导出 |

## 开发

```bash
bun install
bun run dev
bun run build
bun run preview
```

## 认证

1. 登录 → `POST /web/auth/login` 获取 JWT Token
2. Token 存 localStorage，后续请求自动携带
3. 过期后跳转登录页
