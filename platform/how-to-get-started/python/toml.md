poetry run python -m pip install tomlkit

```py
# scripts/set_torch_wheel.py
from tomlkit import parse, dumps
from pathlib import Path

PYPROJECT = Path("pyproject.toml")
TORCH_WHL_URL = "https://download.pytorch.org/whl/cpu/torch-2.7.0-<tags>.whl"

doc = parse(PYPROJECT.read_text())

deps = doc["tool"]["poetry"]["dependencies"]
deps["torch"] = {"url": TORCH_WHL_URL}
deps["transformers"] = "4.52.4"

PYPROJECT.write_text(dumps(doc))
print("Updated pyproject.toml")
```
