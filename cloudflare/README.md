# Cloudflare deployment

This directory deploys the Study Hub UI to Cloudflare Pages and serves the local
policy-audited PDFs from a private R2 bucket. The repository never contains the PDF
corpus. The Pages Worker uses HTTP Basic Authentication before serving any route and
stores private reading history, including the last key page or section opened, in D1.
Assignment mastery and the 1/3/7/21-day review schedule live in the same versioned D1
progress payload, so this release needs no database migration.

Production URL: https://ai-engineering-study-hub.pages.dev

The generated credentials are stored locally at `../.study-hub-credentials`; that file
is ignored by Git and was never uploaded.

## Build assets

From the library root:

```bash
python3 cloudflare/generate-assets.py
```

This copies the UI, emits the document metadata and compact page-search indexes, and
includes only personal library notes. The page index is loaded lazily by the browser
only after a search begins. The build has no dependency on notes outside this personal
library.

## One-time Cloudflare setup

```bash
npx wrangler r2 bucket create ai-engineering-library
npx wrangler d1 create ai-engineering-study-hub-progress
npx wrangler d1 execute ai-engineering-study-hub-progress --remote --file cloudflare/schema.sql
npx wrangler pages project create ai-engineering-study-hub --production-branch main
npx wrangler pages secret put AUTH_USER --project-name ai-engineering-study-hub
npx wrangler pages secret put AUTH_PASSWORD --project-name ai-engineering-study-hub
```

Set `AUTH_USER` to `mrrobot` and choose a long password. Then upload only the PDFs
whose source terms permit private personal cloud storage:

```bash
npx wrangler r2 object put ai-engineering-library/books/example.pdf --file books/example.pdf
```

For the full set, use the upload helper in `scripts/upload-r2.sh` after reviewing the
manifest. Deploy the Pages output with:

```bash
npx wrangler pages deploy cloudflare/site \
  --project-name ai-engineering-study-hub \
  --commit-message "Deploy private AI systems Study Hub"
```

The Worker expects the R2 binding named `LIBRARY` and D1 binding named `PROGRESS_DB`,
configured in `wrangler.toml`. Keep the R2 bucket private; do not enable a public
bucket. D1 stores only the single authenticated user's reading and project progress.
