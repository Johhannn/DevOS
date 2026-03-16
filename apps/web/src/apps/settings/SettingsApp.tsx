export default function SettingsApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] p-4">
      <div className="text-xs text-muted font-semibold uppercase mb-4">System Settings</div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div>
            <div className="text-sm text-white/80">Theme</div>
            <div className="text-xs text-muted">Choose your preferred color scheme</div>
          </div>
          <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white/80">
            <option>Dark</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div>
            <div className="text-sm text-white/80">Font Size</div>
            <div className="text-xs text-muted">Adjust the base font size</div>
          </div>
          <span className="text-sm text-white/60 font-mono">14px</span>
        </div>
      </div>
    </div>
  );
}
