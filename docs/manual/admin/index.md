> [!WARNING]
> 本页部分内容由 AI 生成，尚未经过人工审核，请谨慎参考。

# 管理后台操作指南

本文档涵盖 AstraSchedule Web 管理后台（NaiveClassSchedule）的所有页面功能与操作说明。管理后台基于 Vue3 + NaiveUI 构建，通过侧边栏菜单可导航到各个功能页面。

## 通用约定

**身份认证**：系统使用 JWT 登录认证。所有涉及修改、新增、删除的操作均需通过密码验证。JWT 登录通过 `/web/auth/login` 获取 Token。密码错误将返回 `401` 提示。

**写操作密码确认**：所有写操作（PUT/POST/DELETE）均需通过 `X-Verify-Password` 头传递密码进行二次确认。

**提交前预览**：课表配置、科目管理、通用设置等页面在提交按钮下方均提供 JSON 预览卡片，便于在提交前检查即将发送的数据。

**菜单结构**：管理后台的左侧菜单由后端 `/web/menu` 接口动态生成，依据数据库中的学校-年级-班级层级树自动组织。新添加的班级会自动出现在菜单中。

## 功能概览

| 页面 | 路径 | 说明 |
|------|------|------|
| [仪表盘](./dashboard) | `/` | 系统实时运行状态概览 |
| [课表配置](./schedule-config) | `/config/:school/:grade/:cls/schedule` | 配置各班级每天的课程安排 |
| [通用设置](./settings-config) | `/config/:school/:grade/:cls/settings` | 调整显示行为和外观参数 |
| [科目管理](./subject-config) | `/config/:school/:grade/subjects` | 管理科目简称与全称映射 |
| [作息表管理](./timetable-config) | `/config/:school/:grade/timetable` | 管理作息时间表模板 |
| [自动任务](./autorun) | `/autorun` | 管理定时自动化任务 |
| [倒数日](./countdown) | `/countdown` | 管理倒数日配置 |
| [实用工具](./tools) | `/tools` | 配置迁移和数据备份 |
| [调休导入](./compensation-import) | `/tools/compensation-import` | 批量导入调休数据 |
| 用户管理 | `/users` | 管理员用户增删改查（admin 角色） |
| 结构管理 | `/structure` | 学校/年级/班级结构管理 |

## 菜单导航

管理后台的左侧菜单完全由后端 `/web/menu` 接口动态生成，根据数据库中配置的学校-年级-班级层级结构自动组织。菜单层级示例如下：

```
仪表盘
课表配置
  > 某中学
    > 高一年级
      > 1 班 - 课表
      > 1 班 - 设置
      > 2 班 - 课表
      > 2 班 - 设置
科目管理
  > 某中学
    > 高一年级 - 科目
    > 高一年级 - 作息
自动任务
倒数日
实用工具
调休导入
```

新增班级后，刷新页面即可在菜单中看到新的配置入口。班级的"课表"和"设置"分别对应课表配置页面和通用设置页面。
