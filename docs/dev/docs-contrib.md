> [!DANGER]
> 本文档由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 文档站（Rspress）

本文档站使用 [Rspress](https://rspress.rs/zh/) 构建。

## 开发

```bash
bun install
bun run dev       # 开发服务器（热重载）
bun run build     # 生产构建
bun run preview   # 预览构建结果
```

## 项目结构

```
docs-site/
├── rspress.config.ts    # Rspress 核心配置
├── tsconfig.json
└── docs/
    ├── _nav.json        # 顶部导航
    ├── index.md         # 首页
    ├── guide/           # 快速开始
    ├── manual/          # 用户手册
    ├── administrator/   # 运维手册
    ├── dev/             # 开发指南
    ├── faq/             # 常见问题
    └── glossary/        # 术语表
```

## 文档编写规范

### 标签规则

| 情况 | 标签 |
|------|------|
| 新建文档 | `> [!DANGER]` AI 编写，全文未审核 |
| 修改已有文档 | `> [!WARNING]` 部分内容未审核 |
| `index.md`、`thanks.md` | 不加标签 |

### 写作要点

- 删除填充短语：此外、值得注意的是、确保、综上所述
- 直接陈述事实：写"支持 MySQL 和 SQLite"而非"系统灵活支持多种数据库"
- 句子短（5 标点/25 字内），动词优先于形容词
- 技术/法律内容可保留翻译腔

### 导航更新

添加新页面后需更新：

1. 所在目录的 `_meta.json`（侧边栏）
2. 如需出现在顶部导航，更新 `docs/_nav.json`

## 部署

构建产物为 `dist/` 目录，支持任意静态托管（GitHub Pages、Cloudflare Pages 等）。无需后端服务。

## 搜索

使用 FlexSearch（Rspress 内置），支持全文搜索，无需额外配置。
