export default function GitClientApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] p-4">
      <div className="text-xs text-muted font-semibold uppercase mb-3">Git Client</div>
      <div className="text-sm text-white/60 font-mono space-y-2">
        <div className="text-green-400">✓ main (up to date)</div>
        <div className="text-white/40 text-xs">No uncommitted changes</div>
      </div>
    </div>
  );
}
