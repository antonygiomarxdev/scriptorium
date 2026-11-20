# Pickups PRD

Status: Approved (2026-11-14)

## Summary

Families book one pickup slot a week and can give it back in time for another family to take it. Slots have a fixed number of places, so nobody queues for a parcel that is not there. Booking and cancelling work in English and Spanish. Collecting at the door and the stock behind each parcel are outside this slice.

Last change: 2026-11-14, approved with four requirements

Part of [the product overview](../PRODUCT.md). States what, not how: name no technology.

## Why
[REQ-1](../requests/REQ-1-book-a-pickup-slot.md): families queue for hours and a third of the parcels go unclaimed.

## Use cases
UC-3 (book a pickup slot) and UC-4 (cancel a booking), both from the product overview.

## Requirements
- **R-PICKUPS-1.** A family can book one slot per week from the slots that still have free places.
- **R-PICKUPS-2.** A family can cancel its booking until two hours before the slot starts, and the place becomes free.
- **R-PICKUPS-3.** A slot never holds more bookings than it has places, even when two families book at the same moment.
- **R-PICKUPS-4.** Booking and cancelling work in English and Spanish, each family seeing its own language.

## Principles honored
Principle 2 shapes R-PICKUPS-4: a family is not blocked by a language it does not read. Principle 3 shapes R-PICKUPS-1: the weekly limit has no exceptions on any screen.

## Non-goals
This slice does not take payment, does not send reminders, and does not hand out parcels at the door. A volunteer cannot book for a family here.

## Dependencies
None: the slice needs only the slots the coordinator sets. Recording donations (the donations slice) does not block it.

## Success criteria
Within two months of release, at least 70% of weekly parcels are booked in advance, and unclaimed parcels fall below 10%.

## Open questions
None.
