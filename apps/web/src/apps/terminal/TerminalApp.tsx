export default function TerminalApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] p-4 font-mono text-sm text-green-400">
      <div className="text-muted text-xs mb-2">DevOS Terminal v0.1.0</div>
      <div className="flex items-center gap-2">
        <span className="text-accent">~</span>
        <span className="text-muted">$</span>
        <span className="animate-pulse">▊</span>
      </div>
    </div>
  );
}
