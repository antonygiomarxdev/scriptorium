# ADR-0006: Keep Larder's data in a file-based database

## Status
Accepted

## Summary
Larder stores everything in one SQLite file on the pantry server. A hosted database was rejected for cost and for a failure case on every booking.

Last change: 2026-11-19, proposed from TD-1 of the cross-cutting TP

## Context
TD-1 of the [cross-cutting TP](../tp/TP.md): where Larder keeps its data. One pantry, a few hundred families, one server, one volunteer who maintains it two hours a week.

## Options considered
- **A file-based database on the server.** Pros: no extra service, a backup is one file copy, no network failure inside a booking. Cons: one writer at a time; moving to two servers later means a migration.
- **A hosted database service.** Pros: many writers, managed backups. Cons: a monthly fee the pantry has no budget for, an outside account to keep, and bookings fail when the network does.

## Decision
Option A, the file-based database.

## Consequences
Booking a slot can use one conditional update inside a transaction (TP-01 TD-1). A second server is a new decision that supersedes this one. Watch the file size and the nightly copy: if either fails, the coordinator is told.
