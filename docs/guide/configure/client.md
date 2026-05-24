> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu233@qq.com

# 客户端本地配置

客户端配置文件位于安装目录的 `resources/app.asar.unpacked/js/scheduleConfig.js`。

> 如果找不到 `app.asar.unpacked` 目录，说明你用的是非官方打包版本或自编译版本，请确认打包时是否启用了 `asarUnpack`。

## 什么时候需要改这个文件？

- 客户端**没有连接云端服务**（离线模式），需要手动配置课表
- 需要修改客户端外观（字体大小、透明度、颜色等）
- 作为离线兜底配置，云端出问题时至少能显示一个静态课表
- 客户端首次启动时需要指定学校、年级、班级

## 工作方式

客户端启动时会执行以下逻辑：

1. 尝试从云端拉取配置
2. 拉取成功 → 使用云端配置（当前会话）
3. 拉取失败 → 使用本地 `scheduleConfig.js` 中的默认配置
4. 用户也可以通过 `scheduleConfig.user.jsonc` 覆盖部分配置项（支持 JSONC 注释格式）

## 主要配置项

### 基础信息

| 字段 | 说明 | 示例 |
|------|------|------|
| `school` | 学校标识 | `"39"` |
| `grade` | 年级标识 | `"2023"` |
| `class_number` | 班级号 | `"1"` |

### 课表数据

| 字段 | 说明 |
|------|------|
| `subjects` | 科目简称 ↔ 全称映射。简称支持 `@` 下角标语法（如 `自@语` → 自ᵧ） |
| `timetable` | 作息时间表。支持多个（如 `常日`、`考试周`），每天可独立选择 |
| `schedule` | 每日课表。周一至周日，每节课对应一个科目简称 |
| `clientConfig` | 客户端显示设置（倒计时、天气、横幅等） |

### 显示设置（clientConfig）

| 字段 | 说明 |
|------|------|
| `countdownMode` | 倒计时模式：`"hidden"` 隐藏 / 日期字符串（如 `"2026-06-20"`） |
| `showWeek` | 是否显示周数 |
| `bannerText` | 顶部横幅文字，空则不显示 |
| `weather` | 天气配置：`mode: "brief"` 简略 / `mode: "detail"` 详细 |
| `temperatureColors` | 温度颜色映射。支持离散（`type: "discrete"`）和渐变（`type: "interpolate"`）两种模式 |

### CSS 变量

`cssVariables` 对象中可覆盖客户端所有样式变量，如：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `--font-size-base` | 基础字号 | `16px` |
| `--banner-height` | 横幅高度 | `40px` |
| `--opacity-normal` | 正常透明度 | `1` |
| `--opacity-low` | 鼠标离开时透明度 | `0.1` |
| `--border-radius` | 圆角 | `8px` |

## 示例

```js
// scheduleConfig.js 片段
const config = {
  school: "39",
  grade: "2023",
  class_number: "1",

  subjects: {
    "语": "语文",
    "数": "数学",
    "自@物": "物理",
  },

  timetable: {
    "常日": {
      periods: [
        { start: "08:00", end: "08:45", type: "class", index: 1 },
        { start: "08:55", end: "09:40", type: "class", index: 2 },
        // ...
      ],
      divider: [4], // 第 4 节后加分隔线
    },
  },

  schedule: {
    "周一": ["语", "数", "英", "自@物", "化", "体", "音", "美"],
    "周二": ["数", "语", "英", "自@物", "化", "史", "体", "音"],
    // ...
  },

  clientConfig: {
    countdownMode: "2026-06-20",
    showWeek: true,
    bannerText: "诚信考试 作弊可耻",
  },
};
```

## 注意事项

- 文件格式为 JavaScript，不是纯 JSON。支持注释和 JS 语法
- 如果客户端接入了云端服务，本地配置仅作兜底。日常修改应通过管理端操作
- 修改后需要重启客户端生效
- 如果配置了 `scheduleConfig.user.jsonc`，其中的内容会与 `scheduleConfig.js` 深度合并，可以只写需要覆盖的项
