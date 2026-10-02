> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# 数据库维护

本章介绍 SQLite 与 MySQL 的日常维护事项，帮助保持数据库稳定、可恢复。

## SQLite

### 文件与备份

- 数据库是单个文件，路径由 `config.toml` 的 `db.path` 指定（模板默认 `./data/astra_schedule.db`）
- 备份 = 复制文件。建议先停止服务或使用文件快照，避免复制到写入中的文件（见[备份策略](./backup)）

### 日志模式：拒绝 WAL

本项目**不使用** SQLite 的 WAL（Write-Ahead Logging）模式，服务启动时会检查库头：

- 检测到 WAL 库时**自动转回**默认的 rollback journal 模式（`PRAGMA journal_mode=DELETE`），转换失败才拒绝启动并打印离线转换命令
- WAL 依赖的 `-shm` 共享内存不会跨 NFS 客户端共享，多个服务（如 usr-backend 与 sys-backend）经 NFS 打开同一库时会报 `database disk image is malformed` 甚至损坏数据；本项目读多写少，WAL 的并发写收益也用不上
- 如需手工转换：停掉**所有**后端后执行 `sqlite3 <db文件> "PRAGMA journal_mode=DELETE;"`

因此备份时直接 `cp` 数据库文件即可，无需关心 `-wal`/`-shm` 附属文件（正常运行的库根本不会产生它们）。

### 文件增长与压缩

SQLite 删除数据后文件大小不会自动缩小。若发现数据库文件异常膨胀（长期频繁写入后），可执行压缩：

```bash
# 停止服务后执行
sudo systemctl stop astraschedule
sqlite3 /opt/astraschedule/data/astra.db "VACUUM;"
sudo systemctl start astraschedule
```

> VACUUM 会重写整个数据库文件，执行前务必先备份。一般学校场景数据量小，无需定期压缩。

### 完整性检查

```bash
sqlite3 /opt/astraschedule/data/astra.db "PRAGMA integrity_check;"
```

返回 `ok` 表示数据库完好。

## MySQL

- 依赖数据库自身的自动备份（如 RDS 自动备份，见[备份策略](./backup)）
- 日常维护（慢查询、容量、索引）可在 MySQL 控制台查看
- 不建议在运行中手动改动表结构，表结构变更由后端启动时的 AutoMigrate 完成

## 备份有效性验证

备份只有在**能恢复**时才有价值。建议每学期至少做一次「备份演练」：

1. 导出一份当前 JSON 备份
2. 在测试环境（或临时目录部署一个后端）导入该备份
3. 确认各班级课表、作息、设置、自动任务完整

演练中发现的问题（如备份文件损坏）应尽早处理，避免真正需要恢复时才发现。

## 磁盘空间

- 日志文件（journald、Nginx）可能持续增长，建议定期清理或配置日志轮转
- 保留至少 1GB 可用空间，避免数据库写入失败
