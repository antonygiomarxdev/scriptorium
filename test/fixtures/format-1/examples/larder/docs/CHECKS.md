# Project checks

Every rule this project learned from a failure, enforced. A row with no command fails. Each check ships with the replay of the failure it catches.

| ID | Prevents | Command | Replay |
|---|---|---|---|
| CHECK-1 | A booking accepted after its slot started (RETRO-1) | `bun test test/started-slot.test.ts` | The fixture `test/fixtures/started-slot.fixture.ts` books a slot one minute after its start; the test fails if the booking is accepted |
