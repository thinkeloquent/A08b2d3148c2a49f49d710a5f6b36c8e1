"""NumPy essentials — fast math operations and array handling."""

import numpy as np


def main():
    # ── 1. Array creation ─────────────────────────────────────────────────
    a = np.array([1, 2, 3, 4, 5])
    b = np.arange(0, 10, 2)            # [0, 2, 4, 6, 8]
    c = np.linspace(0, 1, 5)           # 5 evenly spaced from 0→1
    zeros = np.zeros((3, 4))
    ones = np.ones((2, 3))
    identity = np.eye(3)

    print("=== Array creation ===")
    print(f"a         : {a}")
    print(f"arange    : {b}")
    print(f"linspace  : {c}")
    print(f"zeros 3×4 :\n{zeros}")
    print(f"ones  2×3 :\n{ones}")
    print(f"eye   3×3 :\n{identity}")
    print()

    # ── 2. Shape & reshaping ──────────────────────────────────────────────
    m = np.arange(12)
    grid = m.reshape(3, 4)
    print("=== Reshape ===")
    print(f"flat  : {m}")
    print(f"3×4   :\n{grid}")
    print(f"shape : {grid.shape}  ndim : {grid.ndim}  size : {grid.size}")
    print()

    # ── 3. Element-wise arithmetic (vectorised — no loops needed) ────────
    x = np.array([10, 20, 30, 40])
    y = np.array([1, 2, 3, 4])
    print("=== Vectorised arithmetic ===")
    print(f"x + y  = {x + y}")
    print(f"x * y  = {x * y}")
    print(f"x ** 2 = {x ** 2}")
    print(f"sqrt(x)= {np.sqrt(x).round(4)}")
    print()

    # ── 4. Aggregations ──────────────────────────────────────────────────
    data = np.array([[3, 7, 1], [4, 2, 9], [8, 5, 6]])
    print("=== Aggregations ===")
    print(f"data     :\n{data}")
    print(f"sum      : {data.sum()}")
    print(f"col sums : {data.sum(axis=0)}")
    print(f"row means: {data.mean(axis=1).round(2)}")
    print(f"min      : {data.min()}   max : {data.max()}")
    print(f"std      : {data.std():.4f}")
    print()

    # ── 5. Boolean indexing / filtering ──────────────────────────────────
    vals = np.array([12, 5, 88, 34, 7, 61, 23])
    mask = vals > 20
    print("=== Boolean indexing ===")
    print(f"vals      : {vals}")
    print(f"mask >20  : {mask}")
    print(f"filtered  : {vals[mask]}")
    print()

    # ── 6. Broadcasting ──────────────────────────────────────────────────
    mat = np.array([[1, 2, 3], [4, 5, 6]])
    row = np.array([10, 20, 30])
    print("=== Broadcasting ===")
    print(f"mat :\n{mat}")
    print(f"row : {row}")
    print(f"mat + row :\n{mat + row}")
    print()

    # ── 7. Linear algebra ────────────────────────────────────────────────
    A = np.array([[2, 1], [5, 3]])
    b_vec = np.array([4, 7])
    solution = np.linalg.solve(A, b_vec)  # Ax = b
    print("=== Linear algebra ===")
    print(f"A :\n{A}")
    print(f"b : {b_vec}")
    print(f"solution (Ax=b) : {solution}")
    print(f"det(A)          : {np.linalg.det(A):.1f}")
    print()

    # ── 8. Random number generation ──────────────────────────────────────
    rng = np.random.default_rng(42)
    samples = rng.normal(loc=100, scale=15, size=10).round(2)
    print("=== Random (seeded) ===")
    print(f"10 normal samples (μ=100, σ=15): {samples}")
    print()

    # ── 9. Speed comparison hint ─────────────────────────────────────────
    big = rng.random(1_000_000)
    total = big.sum()
    print("=== Performance ===")
    print(f"Summed 1 000 000 random floats = {total:.2f}")
    print("(NumPy does this in C — orders of magnitude faster than a Python loop)")


if __name__ == "__main__":
    main()
