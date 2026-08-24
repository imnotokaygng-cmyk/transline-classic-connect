import { CircleUserRound, DoorOpen } from "lucide-react";
import { buildBusLayout } from "@/lib/seat-layout";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  capacity: number;
  taken: string[];
  reserved?: string[];
  selected: string | null;
  onSelect: (seat: string) => void;
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn("h-4 w-4 rounded-md border-2", className)} />
      {label}
    </span>
  );
}

export function SeatMap({ capacity, taken, reserved = [], selected, onSelect }: SeatMapProps) {
  const layout = buildBusLayout(capacity);
  const takenSet = new Set(taken);
  const reservedSet = new Set(reserved);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <LegendDot className="border-border bg-card" label="Available" />
        <LegendDot className="border-muted-foreground/40 bg-muted" label="Booked" />
        <LegendDot className="border-primary bg-primary" label="Selected" />
        <LegendDot className="border-accent bg-accent" label="Reserved" />
      </div>

      <div className="mx-auto w-full max-w-sm rounded-[2rem] border-4 border-foreground/15 bg-secondary p-3 shadow-sm sm:max-w-md">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-card px-3 py-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <CircleUserRound className="h-5 w-5 text-primary" /> Driver
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Door <DoorOpen className="h-5 w-5 text-primary" />
          </span>
        </div>

        <div className="space-y-2">
          {layout.rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
            >
              {row.map((cell, cellIndex) => {
                if (cell.kind === "aisle") {
                  return <div key={cellIndex} className="min-h-11" aria-hidden />;
                }
                if (cell.kind === "empty") {
                  return <div key={cellIndex} className="min-h-11" aria-hidden />;
                }
                const isTaken = takenSet.has(cell.number);
                const isReserved = reservedSet.has(cell.number);
                const isSelected = selected === cell.number;
                const disabled = isTaken || isReserved;
                return (
                  <button
                    key={cellIndex}
                    type="button"
                    disabled={disabled}
                    aria-label={`Seat ${cell.number}${disabled ? " unavailable" : ""}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(cell.number)}
                    className={cn(
                      "flex h-11 min-w-0 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors",
                      "border-border bg-card text-foreground hover:border-primary",
                      disabled &&
                        "cursor-not-allowed border-muted-foreground/30 bg-muted text-muted-foreground hover:border-muted-foreground/30",
                      isReserved && "border-accent bg-accent text-accent-foreground",
                      isSelected && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {cell.number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
