# Invariants

What must always hold across the product. Every row names an executable check; a row in prose only fails.

| ID | Rule | Owner FRD | Check |
|---|---|---|---|
| INV-1 | A slot's confirmed bookings never exceed its places. | FRD-01 | `bun test test/slot.invariant.test.ts`: property test, 1,000 random booking and cancel sequences |
| INV-2 | A family has at most one confirmed booking in any week. | FRD-01 | `bun test test/week.invariant.test.ts`: property test over 1,000 random sequences |
| INV-3 | A slot's free places equal its places minus its confirmed bookings. | FRD-01 | `bun test test/slot.invariant.test.ts`: asserted after every step of the property test |
