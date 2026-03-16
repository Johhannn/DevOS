"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// ─── App Registry ───────────────────────────────────────────────────────────
// Each app is lazy-loaded via Next.js dynamic() with SSR disabled.
// When a new app is added, register it here.

const appRegistry: Record<string, ReturnType<typeof dynamic>> = {
  'terminal': dynamic(() => import('../../apps/terminal/TerminalApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
  'editor': dynamic(() => import('../../apps/editor/EditorApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
  'explorer': dynamic(() => import('../../apps/explorer/ExplorerApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
  'api-tester': dynamic(() => import('../../apps/api-tester/ApiTesterApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
  'git-client': dynamic(() => import('../../apps/git-client/GitClientApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
  'settings': dynamic(() => import('../../apps/settings/SettingsApp'), {
    ssr: false,
    loading: () => <AppSkeleton />,
  }),
};

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function AppSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-desktop animate-pulse gap-3">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
      <span className="text-xs text-muted font-mono">Loading app...</span>
    </div>
  );
}

// ─── Fallback ───────────────────────────────────────────────────────────────

function UnknownApp({ appId }: { appId: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-desktop gap-3">
      <div className="text-3xl">🚧</div>
      <div className="text-sm text-muted font-mono">
        App &quot;{appId}&quot; is not installed
      </div>
    </div>
  );
}

// ─── Dynamic App Resolver ───────────────────────────────────────────────────

interface DynamicAppProps {
  appId: string;
}

export function DynamicApp({ appId }: DynamicAppProps) {
  // Strip the 'devos.' prefix if present (e.g. 'devos.terminal' → 'terminal')
  const normalizedId = appId.replace(/^devos\./, '');
  const AppComponent = appRegistry[normalizedId];

  if (!AppComponent) {
    return <UnknownApp appId={appId} />;
  }

  return <AppComponent />;
}
