#!/usr/bin/env python3
"""Build the small Pages asset set from the local, policy-audited library.

The PDF corpus itself is never copied into this repository. This script emits a
metadata index and the static UI; PDFs are uploaded separately to a private R2 bucket.
"""

import importlib.util
import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "site"
STATIC = ROOT / "study-hub" / "static"


def load_local_server():
    spec = importlib.util.spec_from_file_location("study_hub_server", ROOT / "study-hub" / "server.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Study Hub indexer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    module = load_local_server()
    OUT.mkdir(parents=True, exist_ok=True)
    for path in STATIC.iterdir():
        destination = OUT / path.name
        if path.is_dir():
            shutil.copytree(path, destination, dirs_exist_ok=True)
        else:
            shutil.copy2(path, destination)

    # The local server mounts assets under /static/. Keep that URL contract in the
    # hosted build too, while retaining root copies for direct asset inspection.
    hosted_static = OUT / "static"
    hosted_static.mkdir(exist_ok=True)
    for name in ("app.js", "styles.css"):
        shutil.copy2(STATIC / name, hosted_static / name)

    items = module.build_library_index()
    (OUT / "library-index.json").write_text(
        json.dumps({"items": items}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    study_path = module.load_study_path()
    for week in study_path.get("weeks", []):
        # These notes live in the employer service repository and stay local.
        week["resources"] = [
            resource
            for resource in week.get("resources", [])
            if not (resource.get("kind") == "note" and resource.get("path", "").startswith("workspace/"))
        ]
    (OUT / "study-path.json").write_text(
        json.dumps(study_path, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    notes = [
        "README.md",
        "JOB-ALIGNED-LEARNING-PATH.md",
        "ROADMAP.md",
        "CAREER-GUIDE-DRAFT.md",
        "RECOMMENDER-SYSTEMS-BOOK-AUDIT.md",
        "DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md",
        "AI-ENGINEERING-BOOK-ACCESS.md",
        "SOURCE-POLICY.md",
    ]
    notes_root = OUT / "notes"
    notes_root.mkdir(exist_ok=True)
    for name in notes:
        source = ROOT / name
        if source.is_file():
            shutil.copy2(source, notes_root / name)


if __name__ == "__main__":
    main()
