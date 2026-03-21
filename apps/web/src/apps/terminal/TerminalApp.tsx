import { TerminalView } from './TerminalView';

export default function TerminalApp() {
  // Can read from systemStore later for font settings if needed
  
  return (
    <div className="w-full h-full bg-black/95 text-white overflow-hidden p-2">
      <TerminalView />
    </div>
  );
}
