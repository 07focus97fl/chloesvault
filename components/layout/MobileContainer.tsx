export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-dvh max-w-[430px] overflow-x-hidden">
      {children}
    </div>
  );
}
