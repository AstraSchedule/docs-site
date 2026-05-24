> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

# 传统部署快速版

假定你已熟悉 Linux、Nginx 和 systemd。

## 环境

- Ubuntu 22.04，固定内网 IP 192.168.1.100
- 后端端口 9000，管理端 Nginx 80
- SQLite（无需装 MySQL）

## 后端

`shell
mkdir /opt/astra && cd /opt/astra
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/latest/download/AstraScheduleServerGo-linux-amd64 -O astrago
wget https://github.com/daizihan233/AstraScheduleServerGo/releases/latest/download/config.toml
chmod +x astrago
`

config.toml 修改 secret.token 和 server.domain，数据库留空（SQLite）。

`ini
# /etc/systemd/system/astrago.service
[Unit]
Description=AstraSchedule Server
After=network.target

[Service]
Type=simple
ExecStart=/opt/astra/astrago
WorkingDirectory=/opt/astra
Environment=GIN_MODE=release
Restart=always

[Install]
WantedBy=multi-user.target
`

`shell
systemctl daemon-reload && systemctl enable --now astrago
`

## 管理端

`shell
git clone https://github.com/daizihan233/AstraScheduleWeb /opt/astra-web
cd /opt/astra-web
# 修改 src/global.js: APISRV = "http://192.168.1.100:9000"
npm install && npm run build
`

`
ginx
# /etc/nginx/sites-available/astra-web
server {
    listen 80;
    root /opt/astra-web/dist;
    index index.html;
    location / { try_files  / /index.html; }
}
`

`shell
ln -s /etc/nginx/sites-available/astra-web /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
`

## 客户端

参见 [客户端安装指南](../paas/client.md)，服务端地址填 192.168.1.100:9000。
