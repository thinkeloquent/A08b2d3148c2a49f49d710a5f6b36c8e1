"""Matplotlib & Seaborn essentials — charts, graphs, and visual dashboards."""

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns


def main():
    rng = np.random.default_rng(42)
    sns.set_theme(style="whitegrid")

    # ── sample dataset ────────────────────────────────────────────────────
    months = pd.date_range("2024-01", periods=12, freq="MS")
    df = pd.DataFrame({
        "month": months,
        "revenue":  rng.integers(40_000, 120_000, 12),
        "expenses": rng.integers(30_000, 90_000, 12),
        "region":   rng.choice(["East", "West", "Central"], 12),
    })
    df["profit"] = df["revenue"] - df["expenses"]

    # ── 1. Line chart (Matplotlib) ───────────────────────────────────────
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(df["month"], df["revenue"], marker="o", label="Revenue")
    ax.plot(df["month"], df["expenses"], marker="s", label="Expenses")
    ax.fill_between(df["month"], df["revenue"], df["expenses"], alpha=0.15)
    ax.set(title="Revenue vs Expenses (2024)", xlabel="Month", ylabel="USD")
    ax.legend()
    fig.autofmt_xdate()
    fig.tight_layout()
    fig.savefig("01_line_chart.png", dpi=150)
    print("Saved 01_line_chart.png")
    plt.close(fig)

    # ── 2. Bar chart (Matplotlib) ────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(8, 4))
    x = np.arange(len(df))
    width = 0.35
    ax.bar(x - width / 2, df["revenue"], width, label="Revenue")
    ax.bar(x + width / 2, df["expenses"], width, label="Expenses")
    ax.set(title="Monthly Comparison", ylabel="USD")
    ax.set_xticks(x)
    ax.set_xticklabels(df["month"].dt.strftime("%b"), rotation=45)
    ax.legend()
    fig.tight_layout()
    fig.savefig("02_bar_chart.png", dpi=150)
    print("Saved 02_bar_chart.png")
    plt.close(fig)

    # ── 3. Histogram + KDE (Seaborn) ─────────────────────────────────────
    samples = rng.normal(100, 15, 500)
    fig, ax = plt.subplots(figsize=(7, 4))
    sns.histplot(samples, kde=True, bins=30, ax=ax)
    ax.set(title="Distribution (μ=100, σ=15)", xlabel="Value", ylabel="Count")
    fig.tight_layout()
    fig.savefig("03_histogram.png", dpi=150)
    print("Saved 03_histogram.png")
    plt.close(fig)

    # ── 4. Box plot by category (Seaborn) ────────────────────────────────
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.boxplot(data=df, x="region", y="profit", ax=ax)
    ax.set(title="Profit by Region")
    fig.tight_layout()
    fig.savefig("04_boxplot.png", dpi=150)
    print("Saved 04_boxplot.png")
    plt.close(fig)

    # ── 5. Heatmap (Seaborn) ─────────────────────────────────────────────
    corr = df[["revenue", "expenses", "profit"]].corr()
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax)
    ax.set(title="Correlation Matrix")
    fig.tight_layout()
    fig.savefig("05_heatmap.png", dpi=150)
    print("Saved 05_heatmap.png")
    plt.close(fig)

    # ── 6. Scatter with regression line (Seaborn) ────────────────────────
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.regplot(data=df, x="revenue", y="profit", ax=ax)
    ax.set(title="Revenue → Profit")
    fig.tight_layout()
    fig.savefig("06_scatter_reg.png", dpi=150)
    print("Saved 06_scatter_reg.png")
    plt.close(fig)

    # ── 7. Multi-plot dashboard (subplots) ───────────────────────────────
    fig, axes = plt.subplots(2, 2, figsize=(12, 9))

    axes[0, 0].plot(df["month"], df["profit"], "g-o")
    axes[0, 0].axhline(0, color="red", linestyle="--", linewidth=0.8)
    axes[0, 0].set(title="Monthly Profit")
    fig.autofmt_xdate()

    sns.barplot(data=df, x="region", y="revenue", estimator="mean", ax=axes[0, 1])
    axes[0, 1].set(title="Avg Revenue by Region")

    axes[1, 0].pie(
        df.groupby("region")["revenue"].sum(),
        labels=df.groupby("region")["revenue"].sum().index,
        autopct="%1.1f%%",
        startangle=90,
    )
    axes[1, 0].set(title="Revenue Share")

    sns.violinplot(data=df, x="region", y="expenses", ax=axes[1, 1])
    axes[1, 1].set(title="Expense Distribution")

    fig.suptitle("Dashboard — 2024 Financial Overview", fontsize=14, y=1.01)
    fig.tight_layout()
    fig.savefig("07_dashboard.png", dpi=150)
    print("Saved 07_dashboard.png")
    plt.close(fig)

    print("\nAll charts saved.")


if __name__ == "__main__":
    main()
