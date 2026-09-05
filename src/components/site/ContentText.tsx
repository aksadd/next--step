import { cn } from "@/lib/utils";

/**
 * Renders editable site copy. Text containing "[TO VERIFY" is visually flagged so
 * placeholder content is never mistaken for approved copy.
 */
export function ContentText({
  value,
  className,
  fallback,
}: {
  value?: string | null;
  className?: string;
  fallback?: string;
}) {
  const text = (value ?? "").trim() || fallback || "";
  if (!text) return null;
  const needsReview = text.includes("[TO VERIFY");

  return (
    <div className={cn("space-y-4", className)}>
      {text
        .split(/\n{2,}/)
        .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {needsReview ? (
        <p className="inline-flex rounded-full border border-dashed border-primary/60 px-3 py-1 text-xs font-semibold text-primary">
          Placeholder text — replace in the admin area before launch
        </p>
      ) : null}
    </div>
  );
}
