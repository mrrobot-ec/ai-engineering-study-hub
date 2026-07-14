#!/usr/bin/env python3
"""Build the small Pages asset set from the local, policy-audited library.

The PDF corpus itself is never copied into this repository. This script emits a
metadata index and the static UI; PDFs are uploaded separately to a private R2 bucket.
"""

import importlib.util
import json
import re
import shutil
import subprocess
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "site"
STATIC = ROOT / "study-hub" / "static"

STOP_WORDS = {
    "about", "after", "again", "against", "also", "among", "because", "been", "before", "being",
    "between", "both", "can", "could", "does", "each", "from", "have", "into", "more", "most",
    "not", "only", "other", "our", "over", "such", "than", "that", "the", "their", "then", "there",
    "these", "they", "this", "through", "under", "using", "was", "were", "when", "where", "which",
    "while", "will", "with", "would", "you", "your", "and", "for", "are", "but", "has", "its", "may",
    "paper", "figure", "table", "section", "chapter", "et", "al", "www", "http", "https", "org", "com",
}


def load_local_server():
    spec = importlib.util.spec_from_file_location("study_hub_server", ROOT / "study-hub" / "server.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Study Hub indexer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def page_terms(text: str) -> str:
    tokens = re.findall(r"[a-z][a-z0-9][a-z0-9_+.-]{1,}", text.lower())
    counts = Counter(token for token in tokens if token not in STOP_WORDS and not token.isdigit())
    first_positions = {token: index for index, token in reversed(list(enumerate(tokens)))}
    ranked = sorted(counts, key=lambda token: (-counts[token], first_positions[token], token))[:64]
    return " ".join(ranked)


def page_snippet(text: str) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    compact = re.sub(r"^(arxiv:\S+\s+)?", "", compact, flags=re.IGNORECASE)
    return compact[:240]


def extract_pages(source: Path, expected_pages: int) -> list[str]:
    result = subprocess.run(
        ["pdftotext", "-layout", str(source), "-"],
        check=False,
        capture_output=True,
        text=True,
        timeout=180,
    )
    extracted = result.stdout.split("\f")
    if expected_pages and len(extracted) > expected_pages + 1:
        physical_pages = []
        for page_number in range(1, expected_pages + 1):
            page_result = subprocess.run(
                ["pdftotext", "-f", str(page_number), "-l", str(page_number), "-layout", str(source), "-"],
                check=False,
                capture_output=True,
                text=True,
                timeout=30,
            )
            physical_pages.append(page_result.stdout.replace("\f", " "))
        return physical_pages
    return extracted[:expected_pages] if expected_pages else extracted


def build_page_index(items: list[dict[str, object]]) -> dict[str, object]:
    documents = []
    pages = []
    for document_index, item in enumerate(items):
        documents.append({
            "path": item["path"],
            "title": item["title"],
            "category": item["category"],
            "pages": item["pages"],
            "bytes": item["bytes"],
            "year": item["year"],
        })
        source = ROOT / str(item["path"])
        try:
            extracted_pages = extract_pages(source, int(item["pages"] or 0))
        except (OSError, subprocess.SubprocessError):
            continue
        for page_number, text in enumerate(extracted_pages, start=1):
            terms = page_terms(text)
            snippet = page_snippet(text)
            if terms or snippet:
                pages.append([document_index, page_number, terms, snippet])
    return {"version": 1, "documents": documents, "pages": pages}


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
    for name in ("app.js", "styles.css", "marked.umd.js", "marked.LICENSE"):
        shutil.copy2(STATIC / name, hosted_static / name)

    items = module.build_library_index()
    (OUT / "library-index.json").write_text(
        json.dumps({"items": items}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    page_index = build_page_index(items)
    (OUT / "page-index.json").write_text(
        json.dumps(page_index, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    study_path = module.load_study_path()
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
