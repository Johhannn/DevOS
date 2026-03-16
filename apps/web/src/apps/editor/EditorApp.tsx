export default function EditorApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] flex">
      <div className="w-48 border-r border-white/10 p-3">
        <div className="text-xs text-muted font-semibold uppercase mb-2">Explorer</div>
        <div className="text-xs text-white/60 font-mono space-y-1">
          <div>📁 src/</div>
          <div className="pl-3">📄 index.ts</div>
          <div className="pl-3">📄 main.ts</div>
          <div>📄 package.json</div>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-sm text-white/50">
        <span className="text-muted text-xs">Open a file to start editing...</span>
      </div>
    </div>
  );
}
