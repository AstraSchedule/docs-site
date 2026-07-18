# Cloudflare

## 通俗解释

Cloudflare 是一家提供网络安全和加速服务的公司。简单说就是帮你"看门"和"加速"：挡住恶意攻击，让网站访问更快。

AstraSchedule 外网部署使用 Cloudflare 提供 CDN、WAF、HTTPS 证书和 DDoS 防护。

## 专业解释

Cloudflare 是一家全球性的网络安全和性能优化公司，提供 DNS、CDN、WAF、DDoS 防护、SSL/TLS 等服务。

核心产品：
- **DNS**：域名解析，可开启代理模式隐藏源站 IP
- **CDN**：全球节点缓存静态资源，加速访问
- **WAF**：Web 应用防火墙，拦截 SQL 注入、XSS 等攻击
- **DDoS 防护**：自动检测和缓解分布式攻击
- **SSL/TLS**：免费 HTTPS 证书，自动签发和续期
- **Workers**：Serverless 计算平台，可运行边缘代码

免费套餐包含：
- 基础 DDoS 防护
- 全球 CDN
- SSL/TLS 证书
- 基础 WAF 规则集

在 AstraSchedule 中：
- DNS 代理模式隐藏源站 IP
- WAF 拦截恶意请求
- HTTPS 自动管理证书
- Workers 可用于边缘路由、缓存与简单反向代理
