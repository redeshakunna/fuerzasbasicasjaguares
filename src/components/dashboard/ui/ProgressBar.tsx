export function ProgressBar({ value, tone = "green" }: { value: number; tone?: "green" | "turquoise" | "gold" | "maroon" }) {
  const toneClass = {
    green: "bg-jaguar-green-500",
    turquoise: "bg-jaguar-turquoise-500",
    gold: "bg-jaguar-gold-500",
    maroon: "bg-jaguar-maroon-500",
  }[tone];

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-jaguar-ink/8">
      <div
        className={`h-full rounded-full ${toneClass}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
