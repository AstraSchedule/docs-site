# 系统架构

## 组件划分

- `AstraScheduleServerGo`：核心后端 API（Gin + GORM）
- `NaiveClassSchedule`：Web 管理端（Vue + Naive UI）
- `ElectronClassSchedule`：展示端客户端
- `go-valence-cal`：调休计算能力

## 数据作用域模型

### 学校/年级级别

- Subjects
- Timetable

### 学校/年级/班级级别

- Schedule
- ClientConfig

## 关键链路

1. 管理端写配置 → 后端鉴权与校验 → 数据库 upsert
2. 客户端按作用域拉取配置 → 结合调休/自动任务计算当日课节
3. 自动任务按日期触发，动态覆写作息或课表

## 设计要点

- 通过后端兼容 Python 历史接口格式，降低前端改造成本
- 使用“常日”作为兜底作息，提升异常配置容错能力
- 面向 Serverless 场景优化冷启动阶段行为
