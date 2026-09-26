> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# electron-updater（客户端自动更新）

## 通俗解释

electron-updater 让 Electron 程序能自动检查并下载新版本。软件启动后它会去更新源看看有没有新版本，有就后台下载，下载完提示重启安装。

## 专业解释

electron-updater 是 electron-builder 生态的自动更新库，通过读取更新源目录中的 `latest.yml` 元数据判断是否有新版本，支持全量与增量更新。

## 在 AstraSchedule 中

- 默认更新源为对象存储镜像目录 `https://ningbo.rainyun.oss.ymbit.cn/AstraSchedule/latest/`（CI 随发布写入 `latest.yml` / `win10.yml`），可在托盘「更新源（可选）」自定义；启动时会把历史默认源（hubproxy、旧 OSS 目录）自动迁移到该默认源
- 版本号使用 `YYYYMM.D.N` 格式，electron-updater 会将其视为 semver 处理
- 仅打包安装版本生效，开发调试版本不检查更新
- 启动 3 秒后自动检查；托盘「检查更新」可手动触发

参见：[自动更新](../manual/client/auto-update)
