export type SeatCell =
  | { kind: "seat"; number: string }
  | { kind: "aisle" }
  | { kind: "empty" };

export interface BusLayout {
  columns: number;
  rows: SeatCell[][];
  /** Total seats rendered */
  seatCount: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Builds a realistic bus layout from the vehicle capacity.
 * - Up to 16 seats (11/14 seater matatus): 2 + aisle + 1
 * - Larger buses: 2 + aisle + 2, with a full back row
 */
export function buildBusLayout(capacity: number): BusLayout {
  const total = Math.max(1, Math.floor(capacity || 0));
  const small = total <= 16;
  const leftSeats = 2;
  const rightSeats = small ? 1 : 2;
  const perRow = leftSeats + rightSeats;
  const columns = perRow + 1; // + aisle

  const rows: SeatCell[][] = [];
  let seat = 1;

  // Back row on big buses seats one extra passenger across the width
  const backRowSize = small ? 0 : columns;
  const bodySeats = Math.max(0, total - backRowSize);
  const fullRows = Math.floor(bodySeats / perRow);
  const remainder = bodySeats % perRow;

  const pushRow = (count: number) => {
    const row: SeatCell[] = [];
    for (let i = 0; i < leftSeats; i++) {
      row.push(i < count ? { kind: "seat", number: pad(seat++) } : { kind: "empty" });
    }
    row.push({ kind: "aisle" });
    for (let i = 0; i < rightSeats; i++) {
      const index = leftSeats + i;
      row.push(index < count ? { kind: "seat", number: pad(seat++) } : { kind: "empty" });
    }
    rows.push(row);
  };

  for (let r = 0; r < fullRows; r++) pushRow(perRow);
  if (remainder > 0) pushRow(remainder);

  if (backRowSize > 0) {
    const row: SeatCell[] = [];
    for (let i = 0; i < columns; i++) {
      row.push(seat <= total ? { kind: "seat", number: pad(seat++) } : { kind: "empty" });
    }
    rows.push(row);
  }

  return { columns, rows, seatCount: seat - 1 };
}
