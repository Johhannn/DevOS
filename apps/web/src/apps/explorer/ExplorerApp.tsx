export default function ExplorerApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] p-4">
      <div className="text-xs text-muted font-semibold uppercase mb-3">File Explorer</div>
      <div className="space-y-1 font-mono text-sm">
        <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
          📁 <span>home/</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
          📁 <span>projects/</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
          📄 <span>readme.md</span>
        </div>
      </div>
    </div>
  );
}
