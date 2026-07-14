# Distributed-Systems Book Access

Verified 2026-07-13. Commercial books are listed with legal publisher access; they are
not copied from GitHub mirrors or PDF dumps.

## Start with this free textbook

**Maarten van Steen and Andrew S. Tanenbaum, *Distributed Systems*, 4th edition.**

- Official page: https://www.distributed-systems.net/index.php/books/ds4/
- Personalized ebook form:
  https://www.distributed-systems.net/index.php/books/ds4/ds4-ebook/
- Current version shown by the author: 4.03x; 4.03 corresponds to the printed edition.
- Cost: free personalized digital copy.

The form requires a valid email address and a human-verification answer, so automated
download would bypass the author's intended access flow. Complete the form yourself;
after the personalized PDF arrives, it can be placed in `books/` and added to the
catalog. The official figures and Python examples are already stored in
`companion-code/distributed-systems-4e/` from the author's download.

Suggested chapters for this track: architectures and processes; communication;
coordination; consistency and replication; fault tolerance; and distributed security.
Run the Python examples instead of reading every boxed case study.

## The paid systems shelf

| Priority | Book | Why it earns a place | Legal access |
|---:|---|---|---|
| 1 | Kleppmann and Riccomini, *Designing Data-Intensive Applications*, 2nd ed. (2026) | Best current synthesis of data-system trade-offs, streams, transactions, consistency, reliability, and cloud/serverless architecture | https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ |
| 2 | Alex Petrov, *Database Internals* | Storage engines, WALs, B-trees/LSM trees, replication, failure detection, consensus, and distributed transactions | https://www.oreilly.com/library/view/database-internals/9781492040330/ |
| 3 | Brendan Burns, *Designing Distributed Systems* | Compact container-oriented patterns; Microsoft officially advertises a free ebook, though its current landing flow may require registration | https://opensource.microsoft.com/blog/2018/03/26/new-oreilly-e-book-on-designing-distributed-systems-available-for-free-download/ |

Do not substitute an old or unauthorized PDF for the 2026 second edition of DDIA. The
second edition materially updates the first edition for modern cloud, streaming, and
data-system practice.

## Free course and operations references

- MIT 6.5840 Distributed Systems: https://pdos.csail.mit.edu/6.824/
- MIT schedule and canonical paper sequence:
  https://pdos.csail.mit.edu/6.824/schedule.html
- Google SRE books: https://sre.google/books/
- *Software Engineering at Google*: https://abseil.io/resources/swe-book

The ten local papers in `papers/distributed-systems/` supply the primary-source spine.
Read them with the implementation and fault-injection exercises in
`JOB-ALIGNED-LEARNING-PATH.md`.
