#!/usr/bin/env python3
"""Local Study Hub server.

It serves the existing library in place: PDFs are never copied into a site build.
The browser's PDF viewer handles reading, while the small API supplies search and
progress metadata.
"""

import argparse
import json
import mimetypes
import re
import subprocess
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qs, unquote, urlparse


HUB_ROOT = Path(__file__).resolve().parent
LIBRARY_ROOT = HUB_ROOT.parent
STATIC_ROOT = HUB_ROOT / "static"
PATH_FILE = HUB_ROOT / "study-path.json"
PAGE_INDEX_FILE = LIBRARY_ROOT / "cloudflare" / "site" / "page-index.json"
PDF_ROOTS = {"books", "guides", "papers"}
SERVICE_ROOT = LIBRARY_ROOT.parent / "series" / "series-agent-service"
NOTE_PATHS = {
    "README.md": LIBRARY_ROOT / "README.md",
    "JOB-ALIGNED-LEARNING-PATH.md": LIBRARY_ROOT / "JOB-ALIGNED-LEARNING-PATH.md",
    "ROADMAP.md": LIBRARY_ROOT / "ROADMAP.md",
    "CAREER-GUIDE-DRAFT.md": LIBRARY_ROOT / "CAREER-GUIDE-DRAFT.md",
    "RECOMMENDER-SYSTEMS-BOOK-AUDIT.md": LIBRARY_ROOT / "RECOMMENDER-SYSTEMS-BOOK-AUDIT.md",
    "DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md": LIBRARY_ROOT / "DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md",
    "AI-ENGINEERING-BOOK-ACCESS.md": LIBRARY_ROOT / "AI-ENGINEERING-BOOK-ACCESS.md",
    "SOURCE-POLICY.md": LIBRARY_ROOT / "SOURCE-POLICY.md",
    "workspace/LANGGRAPH_ORCHESTRATION.md": SERVICE_ROOT / "docs" / "LANGGRAPH_ORCHESTRATION.md",
    "workspace/agent-context-rearchitecture-design.md": SERVICE_ROOT / "docs" / "superpowers" / "specs" / "2026-06-09-agent-context-rearchitecture-design.md",
}


def clean_title(path: Path, pdfinfo: Dict[str, str]) -> str:
    title = pdfinfo.get("Title", "").strip()
    if title and title.lower() not in {"untitled", "none"}:
        return title
    value = path.stem.replace("_", " ").replace("-", " ")
    value = re.sub(r"\b\d{4}\b", "", value)
    return re.sub(r"\s+", " ", value).strip().title()


def read_pdfinfo(path: Path) -> Dict[str, str]:
    try:
        result = subprocess.run(
            ["pdfinfo", str(path)],
            check=False,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except (OSError, subprocess.SubprocessError):
        return {}
    info: Dict[str, str] = {}
    for line in result.stdout.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        info[key.strip()] = value.strip()
    return info


def category_for(relative: Path) -> str:
    if relative.parts[0] == "books":
        return "Books"
    if relative.parts[0] == "guides":
        return "Guides"
    if len(relative.parts) > 1:
        return relative.parts[1].replace("-", " ").title()
    return "Papers"


def build_library_index() -> List[Dict[str, object]]:
    items: List[Dict[str, object]] = []
    for root_name in sorted(PDF_ROOTS):
        root = LIBRARY_ROOT / root_name
        if not root.exists():
            continue
        for path in sorted(root.rglob("*.pdf")):
            relative = path.relative_to(LIBRARY_ROOT)
            info = read_pdfinfo(path)
            pages = int(info.get("Pages", "0") or 0)
            items.append(
                {
                    "id": relative.as_posix(),
                    "path": relative.as_posix(),
                    "title": clean_title(path, info),
                    "category": category_for(relative),
                    "section": relative.parts[0],
                    "pages": pages,
                    "bytes": path.stat().st_size,
                    "year": re.search(r"\b(19|20)\d{2}\b", path.name).group(0)
                    if re.search(r"\b(19|20)\d{2}\b", path.name)
                    else "",
                }
            )
    return items


def load_study_path() -> Dict[str, object]:
    return json.loads(PATH_FILE.read_text(encoding="utf-8"))


def safe_library_path(relative_text: str, allowed_roots: Optional[set] = None) -> Optional[Path]:
    relative = Path(unquote(relative_text))
    if relative.is_absolute() or ".." in relative.parts:
        return None
    if allowed_roots and (not relative.parts or relative.parts[0] not in allowed_roots):
        return None
    candidate = (LIBRARY_ROOT / relative).resolve()
    try:
        candidate.relative_to(LIBRARY_ROOT.resolve())
    except ValueError:
        return None
    return candidate


class StudyHubHandler(BaseHTTPRequestHandler):
    server_version = "AIStudyHub/1.0"
    library_index: List[Dict[str, object]] = []
    study_path: Dict[str, object] = {}

    def log_message(self, format: str, *args: object) -> None:
        # Keep the terminal useful while still showing errors and requests.
        if self.command != "GET" or self.path.startswith("/api/") is False:
            super().log_message(format, *args)

    def send_bytes(self, payload: bytes, content_type: str, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(payload)

    def send_json(self, payload: object, status: int = 200) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_bytes(data, "application/json; charset=utf-8", status)

    def send_file(self, path: Path) -> None:
        if not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        size = path.stat().st_size
        start = 0
        end = size - 1
        range_header = self.headers.get("Range", "")
        if range_header.startswith("bytes="):
            requested = range_header[6:].split(",", 1)[0].strip()
            try:
                left, right = requested.split("-", 1)
                if left:
                    start = int(left)
                    if right:
                        end = min(int(right), size - 1)
                else:
                    length = int(right)
                    start = max(size - length, 0)
                if start < 0 or start >= size or end < start:
                    raise ValueError
            except (ValueError, TypeError):
                self.send_error(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                return

        length = end - start + 1
        status = HTTPStatus.PARTIAL_CONTENT if range_header else HTTPStatus.OK
        self.send_response(status)
        self.send_header("Content-Type", mimetypes.guess_type(path.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        if status == HTTPStatus.PARTIAL_CONTENT:
            self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.end_headers()
        with path.open("rb") as stream:
            stream.seek(start)
            remaining = length
            while remaining:
                chunk = stream.read(min(1024 * 1024, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)

    def send_static(self, path: Path) -> None:
        if not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_file(path)

    def send_note(self, name: str) -> None:
        path = NOTE_PATHS.get(name)
        if path is None:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content = path.read_text(encoding="utf-8", errors="replace")
        self.send_bytes(content.encode("utf-8"), "text/markdown; charset=utf-8")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        if route == "/" or route == "/index.html":
            self.send_static(STATIC_ROOT / "index.html")
            return
        if route.startswith("/static/"):
            relative = route[len("/static/"):]
            self.send_static(safe_library_path("study-hub/static/" + relative, {"study-hub"}) or Path("/missing"))
            return
        if route == "/api/library":
            self.send_json({"items": self.library_index})
            return
        if route == "/api/study-path":
            self.send_json(self.study_path)
            return
        if route == "/api/search-index":
            self.send_static(PAGE_INDEX_FILE)
            return
        if route == "/api/health":
            self.send_json({"ok": True, "pdfs": len(self.library_index)})
            return
        if route.startswith("/files/"):
            relative = route[len("/files/"):]
            path = safe_library_path(relative, PDF_ROOTS)
            if path is None or path.suffix.lower() != ".pdf":
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            self.send_file(path)
            return
        if route.startswith("/notes/"):
            self.send_note(unquote(route[len("/notes/"):]))
            return
        self.send_error(HTTPStatus.NOT_FOUND)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the local AI engineering Study Hub")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    print("Indexing PDFs (the files stay in place)...")
    StudyHubHandler.library_index = build_library_index()
    StudyHubHandler.study_path = load_study_path()
    server = ThreadingHTTPServer((args.host, args.port), StudyHubHandler)
    print("AI Study Hub: http://%s:%d" % (args.host, args.port))
    print("Press Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Study Hub.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
