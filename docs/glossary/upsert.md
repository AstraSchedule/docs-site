# Upsert

## 通俗解释

Upsert 是"更新或插入"的缩写。意思是：如果记录存在就更新，不存在就插入。一条 SQL 搞定两件事，不用先查再改。

AstraSchedule 用 upsert 保存配置，保证数据一致性。

## 专业解释

Upsert（Update or Insert）是数据库操作，结合了 UPDATE 和 INSERT 功能。

SQL 语法（SQLite）：
```sql
INSERT INTO table (id, name) VALUES (1, 'test')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
```

SQL 语法（MySQL）：
```sql
INSERT INTO table (id, name) VALUES (1, 'test')
ON DUPLICATE KEY UPDATE name = VALUES(name)
```

优势：
- **原子操作**：一条语句完成，无需事务
- **避免竞态**：并发操作不会丢失更新
- **简化代码**：不用先查后改

在 AstraSchedule 中，配置类写入统一使用 upsert，保证数据一致性。
