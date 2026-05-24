---
pageType: home

hero:
  name: 星程课表
  text: AstraSchedule
  tagline: 支持 Windows 7 x86 及以上系统
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
    details: 所有班级的课表、作息、科目等配置统一在 Web 管理端维护，客户端启动自动拉取同步，告别逐班手动修改
    icon: 🔗
  - title: 配置同步
    details: 非 Serverless 模式下通过 WebSocket 实时推送，配置变更秒级生效；Serverless 模式下自动降级为轮询更新，无需人工干预
    icon: 🔄
  - title: 智能调休与临时调课
    details: 根据国务院每年调休数据自动调整课表；支持按日期范围的临时调课，到期自动恢复，无需手动还原
    icon: ↔️
  - title: 天气联动
    details: 实时天气与温度显示，支持温度区间颜色渐变；极端天气预警可自动覆盖顶部横幅，无需手动更新
    icon: 🌤️
  - title: 跑马灯横幅
    details: 顶部滚动字幕，考试季一键切换提示语；天气预警联动，极端天气时自动替换为预警信息
    icon: 📋
  - title: 倒数日
    details: 独立透明窗口展示倒数日程，天数按紧急性自动着色（绿→黄→红），支持多日程优先级排序
    icon: 📆
  - title: 灵活部署
    details: 后端支持 SQLite（无需外部数据库，开箱即用）和 MySQL；可部署于云函数等 Serverless 平台；客户端、管理端、后端可独立部署于不同位置
    icon: 📦
  - title: 高性能后端
    details: 使用 Go + Gin 开发，轻松应对高并发请求；配合 Serverless 弹性伸缩，从容应对上课前集中拉取配置的流量高峰
    icon: ⚡
  - title: 一键备份与复制
    details: 支持全量数据库备份与还原，可跨数据库类型迁移（MySQL ↔ SQLite）；跨班级配置一键复制，快速初始化新班级
    icon: 💾
---

> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

