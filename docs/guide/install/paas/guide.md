> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

# PaaS 保姆级安装指南

本指南面向零基础用户，每一步都有详细说明。遇到不懂的术语会当场解释。

## 第一步：注册域名

域名就是你在浏览器地址栏输入的那个网址（比如 aidu.com）。

<!-- TODO: 截图 - 域名注册页面 -->

1. 打开 [阿里云万网](https://wanwang.aliyun.com/)（或其他域名注册商）
2. 搜索你想要的域名，选择一个便宜的（.top 约 20 元/年）
3. 注册账号并完成实名认证
4. 购买域名

> 记录一下你买的域名，后面要用到。比如 myschool.xyz。

## 第二步：注册 Cloudflare 并接管 DNS

Cloudflare 可以理解为域名的"管家"，同时提供免费的防火墙（WAF）保护你的服务不被恶意攻击。

<!-- TODO: 截图 - Cloudflare 注册页面 -->

1. 打开 [Cloudflare](https://dash.cloudflare.com/sign-up)，注册账号
2. 点击「添加站点」，输入你的域名（如 myschool.xyz）
3. 选择 Free 计划（免费就够用了）
4. Cloudflare 会给你两个新的 DNS 服务器地址（类似 lice.ns.cloudflare.com）
5. 回到域名注册商（阿里云万网），把域名的 DNS 服务器改成 Cloudflare 给的那两个地址

> 💡 **DNS 服务器是什么？** 可以理解为"电话簿"——别人输入你的域名时，该找谁去问这个域名对应的服务器在哪。把它交给 Cloudflare 管理，Cloudflare 就能帮你拦截恶意请求。

<!-- TODO: 截图 - DNS 修改页面 -->

> ⏳ DNS 修改后需要等待几分钟到几小时生效，先继续往下做。

## 第三步：阿里云函数计算部署后端

函数计算可以理解为"不需要你管服务器的云电脑"——把代码扔上去就能跑，按使用量计费，量少免费。

<!-- TODO: 截图 - 阿里云函数计算控制台 -->

### 3.1 开通函数计算

1. 登录 [阿里云函数计算控制台](https://fcnext.console.aliyun.com/)
2. 首次使用需要开通服务，点击「立即开通」（免费）
3. 开通后进入控制台

### 3.2 创建函数

1. 点击「创建函数」
2. 选择「使用自定义运行时」（我们的后端是 Go 语言写的，需要自定义运行时）
3. 函数名称填 stra-schedule
4. 运行时选择 custom（或 custom.debian10）
5. 上传代码包（从 [GitHub Release](https://github.com/daizihan233/AstraScheduleServerGo/releases/latest) 下载对应系统的二进制文件）
6. 配置环境变量和启动命令

<!-- TODO: 截图 - 函数创建页面 -->

### 3.3 配置触发器

函数计算默认不对外暴露网址，需要配置 HTTP 触发器：

1. 在函数详情页点击「触发器管理」
2. 创建触发器，类型选择「HTTP 触发器」
3. 认证方式选择「无需认证」
4. 记录生成的公网访问地址

<!-- TODO: 截图 - 触发器配置 -->

### 3.4 绑定自定义域名

1. 在函数计算控制台选择「域名管理」
2. 添加自定义域名，填入你的域名（如 pi.myschool.xyz）
3. 根据提示到 Cloudflare 添加 DNS 记录（CNAME 指向函数计算的地址）

<!-- TODO: 截图 - 域名绑定 -->

## 第四步：Netlify 部署管理端

Netlify 是一个免费的前端托管平台，可以自动从 GitHub 仓库构建和部署网站。

<!-- TODO: 截图 - Netlify 部署页面 -->

### 4.1 Fork 管理端仓库

1. 打开 [AstraScheduleWeb](https://github.com/daizihan233/AstraScheduleWeb)
2. 点击右上角 Fork 按钮，复制到自己账号下

### 4.2 修改配置

1. 在你 Fork 的仓库中找到 src/global.js 文件
2. 把 APISRV 的值改成你的后端地址（如 https://api.myschool.xyz）
3. 提交修改

### 4.3 部署到 Netlify

1. 打开 [Netlify](https://app.netlify.com/)，用 GitHub 账号登录
2. 点击「Add new site」→「Import an existing project」→ 选择 GitHub
3. 选择你 Fork 的仓库
4. 构建设置保持默认（
pm run build，输出目录 dist）
5. 点击「Deploy site」
6. 部署完成后，在「Domain settings」中添加你的自定义域名（如 dmin.myschool.xyz）

<!-- TODO: 截图 - Netlify 部署步骤 -->

## 第五步：配置 Cloudflare CDN 和 WAF

用 Cloudflare 给你的域名套上 CDN（内容加速）和 WAF（防火墙）。

### 5.1 添加 DNS 记录

1. 进入 Cloudflare 控制台，选择你的域名
2. 点击「DNS」→「记录」
3. 添加两条记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| CNAME | pi | 函数计算的公网地址 | 🟢 已代理 |
| CNAME | dmin | Netlify 分配的地址 | 🟢 已代理 |

<!-- TODO: 截图 - Cloudflare DNS 配置 -->

> 💡 **「已代理」很重要**——这表示流量会先经过 Cloudflare，Cloudflare 帮你在前面挡住恶意请求。

### 5.2 开启 WAF 规则

1. 点击「安全性」→「WAF」
2. 确保 WAF 已启用（免费版自带基础规则）
3. （可选）添加自定义规则：限制 API 请求频率

<!-- TODO: 截图 - WAF 配置 -->

### 5.3 开启 SSL

1. 点击「SSL/TLS」→「概述」
2. 加密模式选择「完全（严格）」
3. Cloudflare 会自动帮你申请和管理 HTTPS 证书

## 第六步：安装客户端

客户端安装在各班教室电脑上。参见 [客户端安装指南](./client.md)。

## 验证部署

1. 浏览器打开 https://admin.myschool.xyz（你的管理端域名），确认能正常访问
2. 在管理端登录后，尝试修改一条配置
3. 在教室电脑上安装客户端，输入 pi.myschool.xyz 作为服务端地址，确认能拉取到配置

## 遇到问题？

- 显示"无法连接"→ 检查 Cloudflare DNS 的代理状态是否为 🟢
- 管理端白屏 → 检查 global.js 中的 APISRV 地址是否填对
- 客户端连不上 → 确认 Cloudflare SSL 模式为「完全（严格）」
