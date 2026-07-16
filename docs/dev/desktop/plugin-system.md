> [!DANGER]
> 本文档由 AI 生成，尚未经过人工审核，请谨慎参考。

# 插件系统

Desktop 客户端支持插件扩展。插件是独立目录，放在 `%APPDATA%/electron_class_schedule/plugins/` 下，每个插件一个子目录。

## 插件结构

```
plugins/
└── my-plugin/
    ├── plugin.json      # 必须，插件清单
    ├── main.js          # 可选，主进程入口
    └── renderer.js      # 可选，渲染进程入口
```

## plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名",
  "main": "main.js",
  "renderer": "renderer.js",
  "permissions": ["fileSystem", "network"],
  "hooks": ["onInit", "onTimeStateChange"],
  "reminders": [
    { "type": "class", "offset": -60 }
  ]
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 插件唯一名称 |
| `version` | 是 | 版本号 |
| `description` | 否 | 插件描述 |
| `author` | 否 | 作者 |
| `main` | 否 | 主进程入口文件路径（相对于插件目录） |
| `renderer` | 否 | 渲染进程入口文件路径 |
| `permissions` | 否 | 权限声明，可选值：`fileSystem`、`network` |
| `hooks` | 否 | 注册的钩子列表（见下方） |
| `reminders` | 否 | 定时提醒配置 |

### 路径安全

`main` 和 `renderer` 的路径会做越界检查，确保解析后的路径仍在插件目录内。`..` 或绝对路径会被拒绝。

## 生命周期钩子

插件通过在 `main.js` 中导出同名函数来注册钩子。钩子函数挂载在 `plugin.json` 的 `hooks` 数组中声明。

### onInit

```js
module.exports = {
    onInit() {
        // 插件加载后立即调用
        // 适合初始化状态、注册定时器等
    }
};
```

### onConfigLoad

```js
module.exports = {
    onConfigLoad(config) {
        // 配置加载时调用
        // 支持返回值管道：返回值作为下一个插件的输入
        // 不返回则透传原值
        return config;
    }
};
```

这是唯一支持返回值管道的钩子。多个插件注册 `onConfigLoad` 时，前一个的返回值作为后一个的输入。

### onRender

```js
module.exports = {
    onRender() {
        // 渲染进程入口加载时调用
        // 可在此注入 DOM 或操作页面
    }
};
```

### onTick

```js
module.exports = {
    onTick() {
        // 每秒调用一次
        // 适合做定时逻辑（轮询、计时等）
    }
};
```

### onTimeStateChange

```js
module.exports = {
    onTimeStateChange(info) {
        // 课表时间状态变化时调用（上课/课间切换）
        //
        // info.state       - 'inClass' | 'break'
        // info.currentTime - 'HH:MM:SS'
        // info.currentTimeSlot - 当前时间段 { type, index, className, startTime, endTime, label }
        // info.nextTimeSlot    - 下一个时间段（可能为 null）
        // info.previousState   - 上一个状态（可能为 null）
        // info.timestamp       - 时间戳
    }
};
```

### onScheduleReminder

```js
module.exports = {
    onScheduleReminder(reminder) {
        // 定时提醒触发时调用
        // 需在 plugin.json 的 reminders 中声明
        //
        // reminder.type          - 'class' | 'break'
        // reminder.offset        - 偏移秒数（负=提前，正=延后）
        // reminder.classIndex    - 课程索引（可能为 undefined）
        // reminder.className     - 课程名称（可能为 undefined）
        // reminder.scheduledTime - 'HH:MM'（可能为 undefined）
        // reminder.currentTime   - 'HH:MM:SS'
    }
};
```

### onDestroy

```js
module.exports = {
    onDestroy() {
        // 插件卸载前调用
        // 适合清理定时器、关闭连接等
    }
};
```

## 钩子触发机制

`PluginManager.triggerHook(hookName, ...args)` 遍历所有注册了该钩子且 `enabled` 的插件，依次调用对应函数。执行顺序：

1. 按插件加载顺序（目录字母序）
2. 跳过未启用的插件
3. 跳过没有主进程模块的插件
4. 异常会被捕获并打印日志，不影响后续插件

## 提醒系统

插件通过 `plugin.json` 的 `reminders` 字段声明定时提醒：

```json
"reminders": [
    { "type": "class", "offset": -60 },
    { "type": "break", "offset": 30 }
]
```

| 字段 | 说明 |
|------|------|
| `type` | `class`（上课提醒）或 `break`（下课提醒） |
| `offset` | 相对于课程开始/结束的偏移秒数。负数=提前，正数=延后 |

`TimeDetector` 每秒检测当前时间，匹配到提醒触发时间后调用 `triggerScheduleReminder`。

## 状态监听

除钩子外，`PluginManager` 还提供内部状态监听接口：

```js
const listener = (info) => { /* info 同 onTimeStateChange */ };
pluginManager.onStateChange(listener);   // 注册
pluginManager.offStateChange(listener);  // 移除
```

这与插件钩子并行通知，用于主进程内部模块监听时间状态变化。

## 渲染进程插件

渲染进程插件通过 `plugin.json` 的 `renderer` 字段指定入口文件。插件管理器通过 `getRendererPlugins()` 返回所有已启用且有渲染进程入口的插件列表，主进程在创建窗口时加载。

## 权限

| 权限 | 说明 |
|------|------|
| `fileSystem` | 文件系统访问 |
| `network` | 网络访问 |

权限目前仅作为声明，实际权限控制由宿主环境负责。

## 管理菜单

右键托盘图标 → 插件管理：

- **插件列表**：勾选启用/禁用
- **安装插件**：选择文件夹复制到插件目录
- **卸载插件**：确认后删除插件目录并清除状态
- **打开插件目录**：在文件管理器中打开
- **刷新插件列表**：重新扫描插件目录

启用/禁用状态通过 `electron-store` 持久化，重启后自动恢复。

## 示例

`main/plugin/example/` 目录包含一个综合示例插件，演示全部 7 个钩子的用法。
