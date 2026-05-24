---
pageType: home

hero:
  name: 星程课表
  text: AstraSchedule
  tagline: 自动调休 · 兼容 Windows 7
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 技术文档
      link: /dev/
    - theme: alt
      text: GitHub
      link: https://github.com/daizihan233/AstraSchedule

features:
  - title: 集控管理
    details: 在网页端统一设置所有班级的课表、作息、科目，客户端开机自动同步。不用一个班一个班去改。
    icon: 🔗
  - title: 配置同步
    details: 如果用自己服务器，改完配置后客户端秒级更新；如果用免费 Serverless 模式，客户端定期自动拉取，不用管。
    icon: 🔄
  - title: 智能调休与临时调课
    details: 自动同步官方调休数据，无需手动填；临时调课设好日期范围，到期自动复原。
    icon: 📅
  - title: 天气联动
    details: 显示实时气温和天气，温度不同颜色不一样；遇到极端天气，顶部会自动弹出预警横幅。
    icon: 🌤️
  - title: 跑马灯横幅
    details: 顶部滚动通知，考试期间可以一键改成“诚信考试”等提示；天气预警来了会自动替换掉普通通知。
    icon: 📋
  - title: 倒数日
    details: 独立小窗口显示距离考试、放假还剩几天，天数越近颜色越红，多个日程按优先级排列。
    icon: 📆
  - title: 灵活部署
    details: 后端可以用 SQLite（不用装数据库，开箱即用）或者 MySQL。能跑在云函数等免费 Serverless 平台上。客户端、网页、后端可以分开放在不同地方。
    icon: 📦
  - title: 高性能后端
    details: 用 Go + Gin 写的，并发能力强。配合 Serverless 可以自动扩容，早上上课前全班一起拉课表也不会卡。
    icon: ⚡
  - title: 一键备份与复制
    details: 可以把整个数据库备份下来，也能在 MySQL 和 SQLite 之间迁移。新建班级时直接复制别的班级的配置，省事。
    icon: 💾
---

