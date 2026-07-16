> [!WARNING]
> 本页部分内容由 AI 生成，尚未经过人工审核，请谨慎参考。

# Go-Valence-Cal 调休计算库

纯打表的中国节假日调休关系计算库，基于 `chinese_calendar` Python 库的数据，覆盖 2004-2026 年。

## 功能

- 节假日判断
- 调休休息日识别
- 调休配对查询（休息日 ↔ 补班日）
- 周数计算

## 核心 API

```go
import valence "github.com/daizihan233/go-valence-cal"

// 节假日检查
valence.IsHoliday("2025-01-29")    // true (春节)
valence.IsInLieu("2025-02-03")     // true (调休休息日)

// 调休配对
valence.CompensationFromHoliday("2025-02-03")  // "2025-01-26", true
valence.CompensationFromWorkday("2025-01-26")  // "2025-02-03", true
valence.CompensationPairs(2025)                 // [{Holiday, Workday}, ...]

// 周数
valence.Weeks(startDate, endDate)
```

## 数据更新

```bash
python gen_table.py
```

更新 `model.go` 中的三张数据表：`holidayTable`、`inLieuTable`、`compensationTable`。

## 在 AstraSchedule 中的用途

通过 Go Modules 引入 `usr-backend`，用于自动推算调休安排、计算周数、判断工作日/休息日。
