> [!DANGER] 
>
> 本文档由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：[kuohu@getastra.cn](mailto:kuohu@getastra.cn)

# User Dashboard 用户管理后台

Vue3 管理后台，供学校管理员配置课表、科目、作息、倒计时等。

## 技术栈

- Vue3 + Vite + Naive UI
- vue-router（路由）
- vue-request（请求管理）

## 项目结构

```
usr-dashboard/
├── index.html              # 入口 HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.js             # 应用入口
    ├── App.vue             # 根组件
    ├── global.js           # 全局配置（API 地址）
    ├── api/                # API 封装
    ├── components/         # 公共组件
    ├── router/             # 路由配置
    ├── utils/              # 工具函数
    └── views/              # 页面组件
```

## 开发

```bash
bun install
bun run dev      # 开发服务器（Vite，支持热重载）
bun run build    # 生产构建
bun run preview  # 预览构建结果
```

## 路径别名

`@` 映射到 `./src` 目录。

## API 调用

- 使用 `vue-request` 管理请求状态
- 认证方式：BasicAuth（用户名 `AstraSchedule`，密码由用户在界面输入）
- 首页通过 1 秒轮询显示 WebSocket 连接状态和客户端统计

## 路由

HTML5 History 模式，所有路由懒加载。参数：`:school`、`:grade`、`:cls`（班级）、`:id`。

## 主题

自动检测系统深色/浅色主题，使用 `useOsTheme` 响应变化。
