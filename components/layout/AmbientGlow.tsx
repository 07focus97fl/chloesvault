export default function AmbientGlow() {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2"
      aria-hidden
    >
      <div
        className="h-[300px] w-[400px] rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse, var(--accent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
