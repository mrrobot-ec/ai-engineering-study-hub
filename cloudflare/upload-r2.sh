#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Uploading PDFs to private R2 bucket ai-engineering-library..."
find books guides papers -type f -name '*.pdf' -print0 |
  while IFS= read -r -d '' file; do
    key="${file#./}"
    echo "  $key"
    npx wrangler r2 object put "ai-engineering-library/$key" \
      --file "$file" \
      --remote \
      --content-type application/pdf \
      --content-disposition inline \
      --cache-control 'private, max-age=3600'
  done

echo "Upload complete."
