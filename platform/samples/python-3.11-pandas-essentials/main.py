"""Pandas essentials — data manipulation, cleaning, and analysis."""

import pandas as pd


def main():
    # ── 1. Create a DataFrame (like an Excel spreadsheet) ─────────────────
    df = pd.DataFrame({
        "employee":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
        "department": ["Eng", "Eng", "Sales", "Sales", "Eng", "Sales"],
        "salary":     [95_000, 87_000, 72_000, 68_000, 110_000, 74_000],
        "start_date": pd.to_datetime([
            "2020-03-15", "2019-07-01", "2021-01-10",
            "2022-06-20", "2018-11-05", "2023-02-28",
        ]),
        "rating":     [4.2, 3.8, None, 4.5, 4.9, None],
    })

    print("=== Raw DataFrame ===")
    print(df)
    print()

    # ── 2. Inspection ─────────────────────────────────────────────────────
    print("=== Info ===")
    print(df.dtypes)
    print(f"\nShape : {df.shape}")
    print(f"Nulls :\n{df.isnull().sum()}")
    print()

    # ── 3. Cleaning — fill missing ratings with the column median ────────
    df["rating"] = df["rating"].fillna(df["rating"].median())
    print("=== After filling NaN ratings ===")
    print(df[["employee", "rating"]])
    print()

    # ── 4. Filtering & boolean indexing ──────────────────────────────────
    high_earners = df[df["salary"] > 80_000]
    print("=== Employees earning > $80k ===")
    print(high_earners[["employee", "salary"]])
    print()

    # ── 5. Adding computed columns ───────────────────────────────────────
    df["tenure_years"] = (pd.Timestamp.now() - df["start_date"]).dt.days / 365.25
    df["tenure_years"] = df["tenure_years"].round(1)
    print("=== With tenure ===")
    print(df[["employee", "start_date", "tenure_years"]])
    print()

    # ── 6. Grouping & aggregation (pivot-table style) ────────────────────
    summary = df.groupby("department").agg(
        headcount=("employee", "count"),
        avg_salary=("salary", "mean"),
        avg_rating=("rating", "mean"),
        avg_tenure=("tenure_years", "mean"),
    ).round(2)

    print("=== Department summary ===")
    print(summary)
    print()

    # ── 7. Sorting ───────────────────────────────────────────────────────
    print("=== Top earners ===")
    print(df.sort_values("salary", ascending=False)[["employee", "salary"]].head(3))
    print()

    # ── 8. String operations ─────────────────────────────────────────────
    df["dept_upper"] = df["department"].str.upper()
    print("=== String ops ===")
    print(df[["employee", "department", "dept_upper"]])
    print()

    # ── 9. Export to CSV ─────────────────────────────────────────────────
    df.to_csv("employees.csv", index=False)
    print("Saved employees.csv")

    # ── 10. Read it back and verify ──────────────────────────────────────
    reloaded = pd.read_csv("employees.csv")
    print(f"Re-read {len(reloaded)} rows from employees.csv")


if __name__ == "__main__":
    main()
