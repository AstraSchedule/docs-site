> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 部署管理端到 Netlify

## 概述

Netlify 是一个免费的前端托管平台，可以自动从 GitHub 仓库构建和部署网站。

## 你需要准备

- GitHub 账号
- 管理端后端地址（如 `https://api.your-domain.com`）

## 步骤

### 1. Fork 管理端仓库

1. 打开 [AstraScheduleWeb](https://github.com/daizihan233/AstraScheduleWeb)
2. 点击右上角 **Fork** 按钮
3. 仓库会复制到你的 GitHub 账号下

<!-- TODO: 截图 - Fork 按钮 -->

### 2. 修改配置

1. 在你 Fork 的仓库中，找到 `src/global.js` 文件
2. 点击编辑按钮，将 `APISRV` 的值改为你的后端地址：

```js
export const APISRV = "https://api.your-domain.com"
```

3. 提交修改（Commit changes）

<!-- TODO: 截图 - 编辑 global.js -->

### 3. 部署到 Netlify

1. 打开 [Netlify](https://app.netlify.com/)，点击 **Log in with GitHub**
2. 授权后，点击 **Add new site** → **Import an existing project**
3. 选择 GitHub，授权 Netlify 访问你的仓库
4. 选择你 Fork 的 `AstraScheduleWeb` 仓库
5. 构建配置保持默认：

| 配置项 | 值 |
|--------|-----|
| Branch | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |

6. 点击 **Deploy site**

<!-- TODO: 截图 - Netlify 部署配置 -->

### 4. 绑定自定义域名

1. 部署完成后，进入 **Domain settings**
2. 点击 **Add custom domain**
3. 输入你的管理端域名，如 `admin.your-domain.com`
4. Netlify 会自动申请 HTTPS 证书
5. 到 Cloudflare 添加 DNS 记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | `admin` | Netlify 给的地址 | 🟢 已代理 |

<!-- TODO: 截图 - Netlify 域名配置 -->

### 5. 初始化数据库

1. 浏览器打开 `https://admin.your-domain.com`
2. 首次访问会进入初始化引导页面
3. 按提示完成数据库初始化（数据会自动写入后端）

### 6. 验证

1. 确认管理端页面能正常加载
2. 尝试在管理端创建一个科目配置，确认保存成功
3. 在客户端输入后端地址，确认能拉取到配置
