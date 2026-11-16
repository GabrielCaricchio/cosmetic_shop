import sys
import json
import yaml
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from Back.main import app

def export_specs():
    docs_dir = project_root / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    openapi_data = app.openapi()

    # 1. Export JSON
    json_path = docs_dir / "openapi.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(openapi_data, f, indent=2, ensure_ascii=False)
    print(f"Exported OpenAPI JSON to: {json_path}")

    # 2. Export YAML
    yaml_path = docs_dir / "openapi.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(openapi_data, f, allow_unicode=True, sort_keys=False)
    print(f"Exported OpenAPI YAML to: {yaml_path}")

if __name__ == "__main__":
    export_specs()
