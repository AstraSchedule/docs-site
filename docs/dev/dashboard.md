> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Dashboard 管理面板

Dashboard 是 AstraSchedule SaaS 版本的管理面板，提供系统用户管理、租户管理、数据浏览编辑等功能。该面板面向运维人员，用于管理整个 SaaS 系统。

## 技术栈

- Vue3 + Vite
- Naive UI 组件库
- vue-router（路由）
- vue-request（请求管理）

## 项目结构

```
dashboard/
├── index.html           # 入口 HTML
├── package.json         # 依赖配置
├── vite.config.js       # Vite 构建配置
└── src/
    ├── main.js          # 应用入口
    ├── App.vue          # 根组件
    ├── auth.js          # 认证逻辑
    ├── global.js        # 全局配置（API 地址）
    ├── api/             # API 封装
    ├── components/      # 公共组件
    ├── router/          # 路由配置
    ├── utils/           # 工具函数
    └── views/           # 页面组件
        ├── Login.vue          # 登录页
        ├── Home.vue           # 首页
        ├── SystemUsers.vue    # 系统用户管理
        ├── Tenants.vue        # 租户管理
        ├── TenantUsers.vue    # 租户用户管理
        ├── Data.vue           # 数据浏览
        ├── DataTable.vue      # 数据表组件
        ├── Tools.vue          # 工具页
        ├── ChangePassword.vue # 修改密码
        └── Layout.vue         # 布局组件
```

## 页面功能

### 登录页

- 用户名密码登录
- JWT Token 管理
- 登录状态持久化

### 首页

- 系统概览信息
- 快捷操作入口

### 系统用户管理

- 列出所有系统用户
- 创建、编辑、删除系统用户
- 用户角色管理

### 租户管理

- 列出所有租户
- 创建租户（含 Cloudflare DNS 配置）
- 封禁、清理、完成租户配置
- 租户状态查看

### 租户用户管理

- 列出所有租户用户
- 创建、编辑、删除租户用户
- 用户与租户关联管理

### 数据浏览

- 查看所有数据表
- 浏览、编辑、删除数据记录
- 数据表结构查看

### 工具页

- 数据库重建
- 单表删除
- 数据库修复
- 备份导入导出

## 开发

```bash
# 安装依赖
bun install

# 开发服务器
bun run dev

# 构建
bun run build

# 预览构建结果
bun run preview
```

## 配置

API 服务器地址在 `src/global.js` 中配置：

```javascript
export const APISRV = 'http://127.0.0.1:9001'
```

## 认证流程

1. 用户在登录页输入用户名密码
2. 调用 `POST /web/auth/login` 获取 JWT Token
3. Token 存储在 localStorage
4. 后续请求自动携带 Token
5. Token 过期后跳转到登录页
