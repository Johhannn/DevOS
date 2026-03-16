export default function ApiTesterApp() {
  return (
    <div className="w-full h-full bg-[#0B0F19] p-4">
      <div className="text-xs text-muted font-semibold uppercase mb-3">API Tester</div>
      <div className="flex gap-2 mb-4">
        <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white/80 font-mono">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          type="text"
          placeholder="https://api.example.com/v1/..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-white/80 font-mono placeholder:text-white/30"
        />
        <button className="bg-accent text-white text-sm px-4 py-1 rounded hover:bg-accent/80 transition-colors">
          Send
        </button>
      </div>
      <div className="text-xs text-muted font-mono">Response will appear here...</div>
    </div>
  );
}
