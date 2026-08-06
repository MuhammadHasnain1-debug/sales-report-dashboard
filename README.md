# Sales Data Cleaner

![Python](https://img.shields.io/badge/Python-3.x-blue)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A Python tool that takes a messy, real-world sales CSV and turns it into clean, analysis-ready data — plus an automatic summary report. Built with the **Python standard library only**, so it runs anywhere with zero setup.

---

## The Problem

Raw exported sales data is almost never clean. This project starts from a CSV that has every common problem at once:

```text
order_id,order_date,product,customer,quantity,unit_price
1001,2024-01-05,PRODUCT a, john smith ,2,19.99
1006,3 Mar 2024, Product C ,Bob Lee,1,9.99
1008,15-03-2024,Product E,,1,30.00
1013,2024/04/05,Product D,Jane Doe,,12.00
1001,2024-01-05,PRODUCT a, john smith ,2,19.99   ← duplicate
```

- **6 different date formats** in one column (`2024-01-05`, `01/15/2024`, `20-01-2024`, `Feb 3, 2024`, `2024/02/14`, `3 Mar 2024`)
- **Inconsistent casing** — `PRODUCT a`, `product a`, and `Product A` are the same product
- **Whitespace** around names (`" john smith "`, `" Product C "`)
- **Duplicate rows**
- **Missing values** — blank customers, quantities, and prices

## The Solution

`clean_data.py` reads `messy_sales.csv`, cleans it, and writes two files:

| Output | Contents |
|---|---|
| `clean_sales.csv` | Fully cleaned dataset with a calculated `revenue` column |
| `summary.json` | Total revenue, revenue by month, top 5 products, order count |

### Before → After

| Field | Before | After |
|---|---|---|
| Date | `3 Mar 2024`, `20-01-2024`, `Feb 3, 2024` | `2024-03-03`, `2024-01-20`, `2024-02-03` |
| Product | `PRODUCT a`, `" Product C "` | `Product A`, `Product C` |
| Customer | `" john smith "`, `` (blank) | `John Smith`, `Unknown` |
| Duplicates | 2 repeated rows | removed |
| Incomplete orders | 3 rows missing qty/price | removed |

---

## Results

From **26 messy rows → 21 clean orders**, generating **$1,128.22** in tracked revenue.

**Revenue by month**

```text
Jan 2024  ██████████                $215.42
Feb 2024  ████████████████████████  $520.88
Mar 2024  ████████                  $179.92
Apr 2024  ████████                  $182.00
Jul 2024  █                          $30.00
```

**Top products by revenue**

```text
Product B  ████████████████████████  $500.50
Product A  ██████████████            $299.85
Product C  ██████                    $129.87
Product D  █████                     $108.00
Product E  ████                       $90.00
```

**Key insights**
- Best month was **February 2024** at $520.88 — nearly half the quarter's revenue.
- **Product B** alone drove **44%** of total revenue.
- Cleaning removed 2 duplicates and 3 incomplete orders, and standardized 6 date formats into one.

---

## How it works

Each type of mess maps to one small, focused function:

| Problem | Fix | Function |
|---|---|---|
| Duplicate rows | Track seen rows in a set, skip repeats | `clean_rows` |
| Mixed date formats | Try known formats until one parses, output `YYYY-MM-DD` | `parse_date` |
| Casing + whitespace | Collapse spaces and title-case | `clean_text` |
| Missing values | Blank customer → `Unknown`; orders missing qty/price are dropped | `to_number` |

## Run it

```bash
python clean_data.py
```

No installation, no dependencies — just Python 3.

```text
Loaded 26 rows, kept 21 clean orders.
Total revenue: 1128.22
```

## Project structure

```text
sales-data-cleaner/
├── clean_data.py      # the cleaning script
├── messy_sales.csv    # deliberately messy input
├── clean_sales.csv    # cleaned output
├── summary.json       # summary report
└── README.md
```

## License

MIT — see [LICENSE](LICENSE).
