// Replay of RETRO-1: a booking arrived after its slot had started and was accepted.
// test/started-slot.test.ts books with this input and must see it rejected (RETRO-1, FR-PICKUPS-01-7).
export const slot = { id: "slot-1", startsAt: "2026-11-18T10:00:00Z", places: 10, booked: 0 };

// One minute after the slot started.
export const booking = { slotId: slot.id, familyId: "family-1", at: "2026-11-18T10:01:00Z" };

export const expected = "rejected";
