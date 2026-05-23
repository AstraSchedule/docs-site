# Web 管理端 API

以下接口前缀默认省略 host。

## 鉴权

写操作通常使用 BasicAuth：

- username: `ElectronClassSchedule`
- password: 服务端配置中的 token

## 配置相关接口

### Subjects

- `GET /web/config/:school/:grade/subjects/options`
- `GET /web/config/:school/:grade/subjects`
- `PUT /web/config/:school/:grade/subjects`

### Timetable

- `GET /web/config/:school/:grade/timetable/options`
- `GET /web/config/:school/:grade/timetable`
- `PUT /web/config/:school/:grade/timetable`

`PUT timetable` 关键约束：

- 必须包含 `常日`
- 自动修正 `timetable` / `divider` key 一致性

### Schedule

- `GET /web/config/:school/:grade/:class_number/schedule`
- `PUT /web/config/:school/:grade/:class_number/schedule`

### Settings

- `GET /web/config/:school/:grade/:class_number/settings`
- `PUT /web/config/:school/:grade/:class_number/settings`

## 复制配置接口（新增）

- `POST /web/config/copy`

请求体：

```json
{
  "from": { "school": "39", "grade": "2023", "class": "1" },
  "to": { "school": "39", "grade": "2023", "class": "2" }
}
```

说明：

- `from` / `to` 中 `class` 与 `class_number` 两种字段都可识别
- 来源与目标完全相同会返回 `400`
- 来源配置缺失返回 `404`
- 复制过程使用事务，失败会整体回滚

返回示例：

```json
{
  "status": 200,
  "from": { "school": "39", "grade": "2023", "class": "1" },
  "to": { "school": "39", "grade": "2023", "class": "2" }
}
```

## 系统备份 / 还原接口（新增）

- `GET /web/backup/export`
- `POST /web/backup/import`

说明：

- 两个接口都需要 BasicAuth。
- `export` 返回完整数据库备份 JSON 文件流。
- `import` 支持两种请求方式：
  - `multipart/form-data` 上传字段 `file`（推荐）
  - 直接提交 JSON 请求体
- 导入策略为 upsert（覆盖更新），支持跨数据库类型迁移（如 MySQL → SQLite）。

### 导出返回

- HTTP `200`
- Header 包含 `Content-Disposition: attachment; filename="astra-backup-*.json"`

### 导入返回示例

```json
{
  "status": 200,
  "message": "备份导入完成",
  "data": {
    "imported": {
      "schedules": 12,
      "client_configs": 12,
      "timetables": 4,
      "subjects": 4,
      "data_versions": 12,
      "autorun_records": 6,
      "countdown_records": 3
    },
    "total": 53
  }
}
```

### 导入失败示例

- `400`：文件类型错误、文件过大、JSON 结构无效
- `401`：鉴权失败
- `500`：数据库事务失败（自动回滚）
