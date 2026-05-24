> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

# 安装管理端

管理端用于可视化地对服务端及客户端进行远程配置

## 开始操作

您可以直接 fork [该仓库](https://github.com/daizihan233/AstraScheduleWeb)，修改配置文件后直接在 Netlify、Vercel、EdgeOne Pages 等您熟悉的平台上部署。

如果需要在服务器部署，需先克隆仓库：

```shell
git clone https://github.com/daizihan233/AstraScheduleWeb
```

在 `AstraScheduleWeb` 目录：

先修改配置文件（参阅 [配置说明](../configure/web.md)），然后执行以下命令：

```shell
npm install
```

您需要部署一个 Nginx 服务进行反向代理，管理端默认不直接对外监听

```shell
npm run dev
```

如果您想以静态方式部署，需要先执行以下命令构建项目：

```shell
npm run build
```

如果您想使用例如 1Panel 的 Linux 管理面板，通过 Docker 统一管理环境的，在部署 Docker Container 时，应选择这个命令：

```shell
npm run doceker-preview
```

至此，管理端部署完毕。

您需要访问管理端，随引导初始化数据库，然后按需求自行修改配置，之后便可安装客户端了。
