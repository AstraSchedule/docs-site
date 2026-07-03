> [!DANGER]
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Go 后端实现约定

## 代码组织

- `router/web`：管理端接口
- `router/client`：客户端接口
- `db`：数据库连接与数据访问（CRUD）
- `service`：规则计算与业务编排
- `startup`：初始化与启动流程
- `middleware`：中间件（认证、CORS、命名空间解析）
- `model/dbTable`：GORM 数据库表模型
- `config`：配置加载（Viper 多格式支持）

## 接口风格

- 保持与既有前端契约兼容
- 参数校验错误返回 `400`
- 资源缺失返回 `404`
- 服务内部异常返回 `500`
- 响应格式：`status`/`message`/`data` 或 `error`/`detail`

## 认证与鉴权

- **BasicAuth**：兼容旧版客户端，用户名 `ElectronClassSchedule` 或 `AstraSchedule`
- **JWT 认证**：HS256 签名，密钥复用 `secret.token`，过期 24 小时
- **写操作密码确认**：`X-Verify-Password` 头传递密码，handler 内部校验
- **内部服务认证**：`X-Internal-Secret` 头，用于 sys-backend 等内部调用

## 数据写入策略

- 配置类写入统一使用 upsert（`ON CONFLICT ... UPDATE ALL`）
- 多表操作（如复制配置）必须使用事务
- SaaS 版本所有表包含 `namespace` 字段，写入时从 JWT claims 获取

## 课表/作息相关约束

- `常日` 为必选作息模板
- `timetable` 与 `divider` key 必须一致（后端自动修正）
- 不合法作息引用应回退到 `常日`

## 调试与验证

建议在提交前执行：

```bash
go build ./...
go fmt ./...
go mod tidy
```
