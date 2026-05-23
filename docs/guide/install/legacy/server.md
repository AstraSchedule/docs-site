# 安装服务端

服务端用于读写数据库，并提供接口给管理端与客户端调用，是系统的核心组件，本文档描述如何部署它。

## 开始操作

> [!TIP]
> 如果需要将服务端部署于公网环境，建议配合 WAF 或 CDN 进行安全防护

创建一个文件夹，用于存放服务器程序与配置文件

在 [GitHub Release](https://github.com/daizihan233/AstraScheduleServerGo/releases/latest) 中下载对应的版本，以常见的 Linux amd64 版本为例：

```shell
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/download/latest/AstraScheduleServerGo-linux-amd64 -O astrago
```

其它系统版本以此类推，Windows 版本直接下载 exe 文件即可

> [!TIP]
> 如果您所使用的环境无法正常连接 GitHub，可尝试自行寻找镜像站，或使用以下命令下载：
> ```shell
> wget https://hubproxy.khbit.cn/https://github.com/daizihan233/AstraScheduleServerGo/releases/download/latest/AstraScheduleServerGo-linux-amd64 -O astrago
> ```

此时的文件可能不具备可执行权限，在 Linux 环境下，您需要运行以下命令赋予可执行权限：

```shell
chmod +x astrago
```

然后下载对应的配置文件

```shell
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/download/latest/config.toml
```

有关配置文件，请参阅 [配置说明](../configure/server.md)，在修改好配置文件后，需要您提交一个请求，否则数据库中没有实际数据：

修改好并保存后，运行以下配置启动服务端：

```shell
GIN_MODE=release ./astrago
```

至此，服务端启动完毕。
