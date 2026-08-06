# Sales Data Cleaner

A small Python script that takes a messy sales CSV and turns it into clean, analysis-ready data.

## What it does

`clean_data.py` reads `messy_sales.csv` and:

- Removes duplicate rows
- Normalizes mixed date formats into `YYYY-MM-DD`
- Fixes casing and trims whitespace on product and customer names
- Handles missing values (blank customers become `Unknown`, orders missing a quantity or price are dropped)
- Calculates revenue per order

It outputs two files:

- `clean_sales.csv` — the cleaned dataset
- `summary.json` — total revenue, revenue by month, top 5 products, and order count

## The mess it handles

The input mixes six date formats (`2024-01-05`, `01/15/2024`, `20-01-2024`, `Feb 3, 2024`, `2024/02/14`, `3 Mar 2024`), inconsistent casing like `PRODUCT a` vs `Product A`, extra whitespace, duplicate rows, and blank cells.

## Run it

```bash
python clean_data.py
```

No dependencies — just Python 3.
