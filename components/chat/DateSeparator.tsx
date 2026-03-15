export default function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-px flex-1 bg-cv-border/50" />
      <span className="text-[11px] font-medium text-text-dim">{label}</span>
      <div className="h-px flex-1 bg-cv-border/50" />
    </div>
  );
}
