"""Sample script demonstrating core data-analysis libraries."""

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                       # non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score


def main():
    # ----- generate synthetic dataset -------------------------------------- #
    rng = np.random.default_rng(42)
    n = 200

    df = pd.DataFrame({
        "feature_a": rng.normal(50, 10, n),
        "feature_b": rng.normal(30, 5, n),
        "noise":     rng.normal(0, 3, n),
    })
    df["target"] = 2.5 * df["feature_a"] + 1.8 * df["feature_b"] + df["noise"]

    print("--- DataFrame info ---")
    print(df.describe().round(2))
    print()

    # ----- train / evaluate a simple linear regression --------------------- #
    X = df[["feature_a", "feature_b"]]
    y = df["target"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    model = LinearRegression().fit(X_train, y_train)
    y_pred = model.predict(X_test)
    score = r2_score(y_test, y_pred)

    print("--- Linear Regression ---")
    print(f"Coefficients : {model.coef_.round(4)}")
    print(f"Intercept    : {model.intercept_:.4f}")
    print(f"R² score     : {score:.4f}")
    print()

    # ----- visualization -------------------------------------------------- #
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    sns.scatterplot(x=y_test, y=y_pred, ax=axes[0], alpha=0.6)
    axes[0].plot(
        [y_test.min(), y_test.max()],
        [y_test.min(), y_test.max()],
        "r--",
    )
    axes[0].set(title="Predicted vs Actual", xlabel="Actual", ylabel="Predicted")

    sns.heatmap(df.drop(columns="noise").corr(), annot=True, fmt=".2f", ax=axes[1])
    axes[1].set(title="Feature Correlation")

    fig.tight_layout()
    fig.savefig("output.png", dpi=150)
    print("Chart saved to output.png")


if __name__ == "__main__":
    main()
