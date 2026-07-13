# AI Systems Study Hub

This is the study dashboard for the library. It keeps the PDFs in their existing
directories, indexes them on startup, renders PDFs and Markdown inside one reader, and
adds a build project to every learning-path topic. The hosted private version syncs
opened resources, completions, and completed projects to Cloudflare D1. Local mode
falls back to browser `localStorage` and uploads no study data.

## Start it

```bash
cd ~/Documents/ai-engineering-library
python3 study-hub/server.py
```

Open http://127.0.0.1:8765. Stop it with `Ctrl-C`.

The server supports byte ranges so the browser can seek inside large PDFs without
copying them into a generated site. The workspace-note links assume the library and
`series-agent-service` remain sibling directories under `~/Documents`.

## How to use it

1. Open **Learning path** and choose the current week.
2. Follow the resource label: **Start here** first, keep **Build with this** open
   while coding, and use **Deep dive**, **Reference**, or **Frontier** only when needed.
3. Use the **Key sections** buttons to jump directly to the relevant PDF page,
   Markdown heading, documentation section, or source directory.
4. Build the smallest version in the service or a scratch project.
5. Inject a failure and measure the result.
6. Mark the resource and project complete only after meeting its acceptance criteria
   and writing the trade-off.

Use `Cmd/Ctrl-K` to jump to library search. The **Library** view searches the 108
curated PDFs by title, filename, and category. Markdown notes render as formatted
documents instead of source text. **Open tab** is useful for keeping a paper and your
code side by side.

## Why this is a web app instead of only MkDocs

MkDocs is excellent for the Markdown curriculum and static navigation, and its built-in
Material search works offline. It is less suitable as the primary reader for this
collection because a normal MkDocs build copies non-Markdown files into its output. The
Study Hub serves the existing 789 MiB of PDFs in place and adds progress, filtering, and
an embedded reader. If the notes later need to be published, the Markdown files can be
placed in a separate MkDocs site without changing this reader.

## Safe local scope

The server exposes only PDFs under `books/`, `guides/`, and `papers/`, plus an explicit
allowlist of study notes and two workspace design documents. It does not expose the
framework clones, credentials, databases, or arbitrary filesystem paths.
