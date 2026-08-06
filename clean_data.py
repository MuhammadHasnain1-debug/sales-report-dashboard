import csv
import json
from collections import defaultdict
from datetime import datetime

INPUT_FILE = "messy_sales.csv"
CLEAN_FILE = "clean_sales.csv"
SUMMARY_FILE = "summary.json"

DATE_FORMATS = [
    "%Y-%m-%d",
    "%m/%d/%Y",
    "%d-%m-%Y",
    "%b %d, %Y",
    "%Y/%m/%d",
    "%d %b %Y",
]


def parse_date(value):
    value = (value or "").strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def clean_text(value):
    return " ".join((value or "").split()).title()


def to_number(value):
    value = (value or "").strip()
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def load_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def clean_rows(rows):
    seen = set()
    cleaned = []
    for row in rows:
        key = tuple((row.get(col) or "").strip() for col in row)
        if key in seen:
            continue
        seen.add(key)

        date = parse_date(row.get("order_date"))
        quantity = to_number(row.get("quantity"))
        price = to_number(row.get("unit_price"))
        if date is None or quantity is None or price is None:
            continue

        quantity = int(quantity)
        revenue = round(quantity * price, 2)

        cleaned.append({
            "order_id": (row.get("order_id") or "").strip(),
            "date": date.strftime("%Y-%m-%d"),
            "product": clean_text(row.get("product")),
            "customer": clean_text(row.get("customer")) or "Unknown",
            "quantity": quantity,
            "unit_price": round(price, 2),
            "revenue": revenue,
        })
    return cleaned


def build_summary(rows):
    revenue_by_month = defaultdict(float)
    product_revenue = defaultdict(float)
    for row in rows:
        revenue_by_month[row["date"][:7]] += row["revenue"]
        product_revenue[row["product"]] += row["revenue"]

    top_products = sorted(product_revenue.items(), key=lambda item: item[1], reverse=True)

    return {
        "total_revenue": round(sum(r["revenue"] for r in rows), 2),
        "order_count": len(rows),
        "revenue_by_month": {m: round(v, 2) for m, v in sorted(revenue_by_month.items())},
        "top_5_products": [{"product": p, "revenue": round(v, 2)} for p, v in top_products[:5]],
    }


def write_csv(rows, path):
    fields = ["order_id", "date", "product", "customer", "quantity", "unit_price", "revenue"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main():
    rows = load_rows(INPUT_FILE)
    cleaned = clean_rows(rows)
    summary = build_summary(cleaned)

    write_csv(cleaned, CLEAN_FILE)
    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Loaded {len(rows)} rows, kept {len(cleaned)} clean orders.")
    print(f"Total revenue: {summary['total_revenue']}")


if __name__ == "__main__":
    main()
