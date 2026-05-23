# 传统部署保姆级指南

本指南面向会用电脑但可能没装过 Linux 的用户。

## 第一步：准备服务器

### 如果你有闲置的 Windows 电脑

1. 确保电脑能 24 小时开机，不会自动休眠
2. 设置固定 IP 地址（联系学校网管要一个，或者从路由器 DHCP 绑定）
3. 关闭 Windows 防火墙（或放行 9000 端口和 80 端口）

> 记录一下这台电脑的 IP 地址，比如 192.168.1.100，后面一直会用到。

### 如果你想装 Linux

推荐 Ubuntu Server 22.04，长期支持版本，网上教程多。

1. 下载 [Ubuntu Server](https://ubuntu.com/download/server)
2. 用 Rufus 写入 U 盘
3. 从 U 盘启动安装
4. 安装时设置固定 IP 地址

<!-- TODO: 截图 - Ubuntu 安装关键步骤 -->

## 第二步：安装后端

### 2.1 下载后端

在服务器上打开终端（Windows 下打开 CMD 或 PowerShell）：

`shell
# 创建存放目录
mkdir astra-server
cd astra-server

# 下载后端程序（以 Linux amd64 为例）
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O astrago

# 如果无法访问 GitHub，使用镜像站
wget https://hubproxy.khbit.cn/https://github.com/daizihan233/AstraScheduleServerGo/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O astrago
`

> Windows 用户直接下载 .exe 文件即可。

### 2.2 给予执行权限（Linux）

`shell
chmod +x astrago
`

### 2.3 下载配置文件

`shell
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/latest/download/config.toml
`

### 2.4 修改配置

用文本编辑器打开 config.toml，修改以下内容：

`	oml
[secret]
token = "改成你自己的密码"  # 随便设一个复杂的

[server]
host = "0.0.0.0"
port = 9000
domain = ["http://192.168.1.100:5173"]  # 改成管理端的地址

[db]
# 留空使用 SQLite，无需额外安装数据库
# 如果需要用 MySQL，填写以下内容：
# host = "YOURS"
# port = 3306
# user = "YOURS"
# pass = "YOURS"
# name = "YOURS"
`

> 💡 **SQLite 是什么？** 一种不需要单独安装的数据库，数据直接存在一个文件里。适合小规模使用，省去装 MySQL 的麻烦。

详细配置说明见 [服务端配置](../../configure/server.md)。

### 2.5 启动后端

`shell
GIN_MODE=release ./astrago
`

看到类似 listening on :9000 的输出就说明启动成功了。

<!-- TODO: 截图 - 后端启动成功 -->

> 💡 这个终端窗口不能关，关了后端就停了。后面会讲怎么让它在后台一直运行。

### 2.6 设置开机自启（Linux）

`shell
# 创建 systemd 服务文件
sudo nano /etc/systemd/system/astrago.service
`

写入以下内容：

`ini
[Unit]
Description=AstraSchedule Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/astra-server
ExecStart=/root/astra-server/astrago
Environment=GIN_MODE=release
Restart=always

[Install]
WantedBy=multi-user.target
`

`shell
# 启动服务并设置开机自启
sudo systemctl daemon-reload
sudo systemctl start astrago
sudo systemctl enable astrago
`

## 第三步：安装管理端

### 3.1 安装 Node.js

`shell
# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Windows
# 从 https://nodejs.org 下载安装包，下一步下一步即可
`

### 3.2 下载管理端

`shell
git clone https://github.com/daizihan233/AstraScheduleWeb
cd AstraScheduleWeb
`

### 3.3 修改配置

编辑 src/global.js：

`js
export const APISRV = "http://192.168.1.100:9000"  // 改成你的后端地址
`

### 3.4 安装依赖并构建

`shell
npm install
npm run build
`

构建完成后，静态文件在 dist 目录下。

### 3.5 配置 Nginx

`shell
# 安装 Nginx
sudo apt install -y nginx

# 创建站点配置
sudo nano /etc/nginx/sites-available/astra-web
`

写入：

`
ginx
server {
    listen 80;
    server_name _;

    root /root/AstraScheduleWeb/dist;
    index index.html;

    location / {
        try_files  / /index.html;
    }
}
`

`shell
# 启用站点
sudo ln -s /etc/nginx/sites-available/astra-web /etc/nginx/sites-enabled/
sudo nginx -t         # 测试配置
sudo systemctl reload nginx
`

### 3.6 初始化数据库

浏览器打开 http://192.168.1.100，按引导完成数据库初始化。

## 第四步：安装客户端

客户端装在教室电脑上。[客户端安装指南](../paas/client.md)。

服务端地址填 http://192.168.1.100:9000（后端的内网地址）。

## 后续

- 日常使用见 [日常运维](../../operations.md)
- 遇到问题见 [常见问题](../../faq.md)
