import { cn } from "@/lib/utils";

const HEIGHTS = [40, 68, 24, 88, 52, 100, 36, 76, 28, 60, 44, 92, 32, 72, 48];

export function Waveform({
  className,
  animated = false,
  bars = HEIGHTS.length,
}: {
  className?: string;
  animated?: boolean;
  bars?: number;
}) {
  return (
    <div className={cn("flex h-8 items-end gap-[3px]", className)} aria-hidden="true">
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className={cn("w-[3px] rounded-full bg-primary/70", animated && "wave-bar")}
          style={{
            height: `${HEIGHTS[index % HEIGHTS.length]}%`,
            animationDelay: animated ? `${(index % 7) * 90}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}
