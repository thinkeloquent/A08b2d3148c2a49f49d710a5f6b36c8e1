"""Scikit-learn essentials — predictive modeling and classical ML."""

import numpy as np
import pandas as pd
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    r2_score,
    mean_absolute_error,
)


def regression_example():
    """Predict a continuous target (e.g. future sales)."""
    print("=" * 60)
    print("1. LINEAR REGRESSION — predicting a continuous value")
    print("=" * 60)

    X, y = make_regression(
        n_samples=300, n_features=3, noise=10, random_state=42,
    )
    feature_names = ["ad_spend", "store_size", "foot_traffic"]
    df = pd.DataFrame(X, columns=feature_names)
    df["sales"] = y

    print(f"Dataset : {df.shape[0]} rows, {len(feature_names)} features")
    print(df.describe().round(2))
    print()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("reg", LinearRegression()),
    ])
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    print(f"R² score : {r2_score(y_test, y_pred):.4f}")
    print(f"MAE      : {mean_absolute_error(y_test, y_pred):.2f}")
    print()


def classification_example():
    """Classify into categories (e.g. churn / no-churn)."""
    print("=" * 60)
    print("2. CLASSIFICATION — predicting a category")
    print("=" * 60)

    X, y = make_classification(
        n_samples=500, n_features=4, n_informative=3,
        n_redundant=1, random_state=42,
    )
    feature_names = ["usage_mins", "support_calls", "tenure", "monthly_bill"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=200)),
        ]),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=5, random_state=42,
        ),
    }

    best_name, best_score, best_model = "", 0.0, None

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"{name:25s}  accuracy = {acc:.4f}")
        if acc > best_score:
            best_name, best_score, best_model = name, acc, model

    print(f"\nBest model: {best_name}")
    print(f"\n--- Classification report ({best_name}) ---")
    print(classification_report(
        y_test, best_model.predict(X_test), target_names=["no-churn", "churn"],
    ))


def cross_validation_example():
    """Show how to evaluate with cross-validation."""
    print("=" * 60)
    print("3. CROSS-VALIDATION — robust model evaluation")
    print("=" * 60)

    X, y = make_classification(
        n_samples=400, n_features=4, random_state=42,
    )

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=50, random_state=42)),
    ])

    scores = cross_val_score(pipe, X, y, cv=5, scoring="accuracy")
    print(f"5-fold CV accuracies : {scores.round(4)}")
    print(f"Mean ± Std           : {scores.mean():.4f} ± {scores.std():.4f}")
    print()


def clustering_example():
    """Group data points into clusters (unsupervised)."""
    print("=" * 60)
    print("4. K-MEANS CLUSTERING — grouping customers")
    print("=" * 60)

    rng = np.random.default_rng(42)
    n = 150

    df = pd.DataFrame({
        "annual_spend":   np.concatenate([
            rng.normal(200, 30, n // 3),
            rng.normal(500, 50, n // 3),
            rng.normal(900, 80, n // 3),
        ]),
        "visit_frequency": np.concatenate([
            rng.normal(5, 2, n // 3),
            rng.normal(15, 3, n // 3),
            rng.normal(30, 5, n // 3),
        ]),
    })

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df)

    km = KMeans(n_clusters=3, random_state=42, n_init=10)
    df["cluster"] = km.fit_predict(X_scaled)

    summary = df.groupby("cluster").agg(
        count=("annual_spend", "count"),
        avg_spend=("annual_spend", "mean"),
        avg_visits=("visit_frequency", "mean"),
    ).round(1)

    print(summary)
    print()

    labels = {0: "Budget", 1: "Mid-tier", 2: "Premium"}
    for cluster_id, row in summary.iterrows():
        label = labels.get(cluster_id, f"Cluster {cluster_id}")
        print(f"  {label}: {int(row['count'])} customers, "
              f"avg spend ${row['avg_spend']:.0f}, "
              f"avg visits {row['avg_visits']:.0f}/mo")
    print()


def main():
    regression_example()
    classification_example()
    cross_validation_example()
    clustering_example()
    print("Done.")


if __name__ == "__main__":
    main()
