# Recommender-Systems Book Audit

Audit date: 2026-07-13. Source folder:
`~/Library/Mobile Documents/com~apple~CloudDocs/recommender systems`.

## Result

| Source file | Identity | Pages | SHA-256 | Disposition |
|---|---|---:|---|---|
| `irbookonlinereading.pdf` | Manning, Raghavan, and Schütze, *Introduction to Information Retrieval* online draft | 581 | `ab67ad67d89309a3d03de219173cfdea471e856a5083c83e49b11be8c01581ea` | Not copied: byte-for-byte duplicate of `books/introduction-to-information-retrieval.pdf` |
| `1aggarwal_c_c_recommender_systems_the_textbook.pdf` | Charu C. Aggarwal, *Recommender Systems: The Textbook* (Springer, 2016) | 518 | `7d473bfb409be0fd036d3f158009c20e47e1275ec92a0d3e19d2d93f707513af` | Not copied: the file's recorded origin is an unrelated third-party university directory, while the book states Springer copyright and all rights reserved |

No source file was deleted or modified.

## Why the Aggarwal file stays outside the curated library

The PDF is structurally valid and its title/copyright pages match the Springer book,
but public availability at a third-party URL does not demonstrate authorization. The
author's official page says the PDF is available through institutions with a Springer
subscription; Springer also sells or provides subscribed access. Use one of those
routes, a library loan, or a copy you already lawfully own:

- Author page: https://www.charuaggarwal.net/Recommender-Systems.htm
- Publisher page: https://link.springer.com/book/10.1007/978-3-319-29659-3

This audit does not make a judgment about how the existing iCloud file was obtained;
it only prevents an unverified copy from becoming part of a library represented as
official/open.

## How useful are the two books?

### Introduction to Information Retrieval

Still foundational for indexes, scoring, evaluation, relevance feedback, probabilistic
retrieval, classification, clustering, and latent semantic indexing. For the current
job, prioritize chapters 4, 6–8, 11–12, and 18. Pair it with modern dense retrieval,
reranking, and RAG papers already in `papers/rag-retrieval/`.

### Recommender Systems: The Textbook

Still a strong classical reference, especially chapters 1–3 (neighborhood and latent
factor methods), 6–9 (hybrids, evaluation, context, time/location), and 12–13
(attack resistance and advanced topics). It predates the current industrial deep
retrieve-and-rank stack, real-time embedding systems, and generative recommenders, so
it should not be the final word on production architecture.

The modern bridge is now local in `papers/recommender-systems/`, ordered in
`JOB-ALIGNED-LEARNING-PATH.md`. Google's official course provides the cleanest web
overview of candidate generation, scoring, and reranking:
https://developers.google.com/machine-learning/recommendation.

