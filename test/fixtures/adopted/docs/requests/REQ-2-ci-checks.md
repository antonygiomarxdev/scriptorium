# REQ-2: CI runs the checks on every change

Status: Accepted

## Summary

Every change runs the document checks and the tests in CI before it merges.

Last change: 2024-05-10, accepted

## Who asked and when
The owner, 2024-05-10.

## What they said
> Run the checks in CI.

## The problem behind it
Checks run only on laptops, so a change can merge without them.

## Evidence
Two changes in April merged with a failing check.

## Decision
- CI-1: CI runs status and the docs lint on every pull request.
- CI-2: CI runs the tests on every pull request.
