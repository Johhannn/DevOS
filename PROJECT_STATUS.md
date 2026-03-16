# DevOS — Project Status
> Last updated: 2026-03-16

## What Is DevOS?

A browser-based operating system built as a **pnpm + Turborepo monorepo**. The goal is a fully functional desktop environment running in the browser — complete apps, a windowing system, a virtual filesystem, and a kernel event bus — inspired by real OS design.

---

## Monorepo Structure

```
DevOS/
├── apps/
│   ├── web/          ← Next.js 16 frontend (the "OS shell")
│   └── api/          ← NestJS backend (minimal, scaffold stage)
└── packages/
    ├── kernel/       ← Core OS primitives (EventBus, ServiceRegistry, stores, types)
    ├── filesystem/   ← Virtual filesystem built on Dexie (IndexedDB)
    ├── ui/           ← Shared component library (Button, Input, ScrollArea, etc.)
    └── types/        ← Shared cross-package type definitions
```

---

## Build Status ✅

| Check | Status |
|---|---|
| `turbo run build` (all 6 packages) | ✅ Passing (exit 0) |
| TypeScript — `web` | ✅ Clean |
| TypeScript — `@devos/kernel` | ✅ Clean |
| TypeScript — `@devos/filesystem` | ✅ Clean (just fixed) |
| TypeScript — `@devos/types` | ✅ Clean (just fixed) |
| TypeScript — `@devos/ui` | ✅ Clean |

---

## What's Done

### `@devos/kernel`

- **`EventBus`** — typed pub/sub event bus with middleware support
- **`ServiceRegistry`** — DI container; services register by name and can be looked up with full type safety via declaration merging
- **`KernelEventMap`** — exhaustive typed event map (filesystem, process, window, notification, AI, system events)
- **`IService`** — base interface all kernel services implement (`name` + `init()`)
- **Zustand stores** (in kernel package, consumed by the web app):
  - `windowStore` — full window lifecycle (open, close, focus, minimise, maximise, restore, drag, resize), z-index management, stagger positioning
  - `processStore` — PID tracking, process start/kill, status
  - `notificationStore` — notification queue
  - `preferencesStore` — user preferences
  - `systemStore` — system-level state

### `@devos/filesystem`

- **`VirtualFileSystem`** — IndexedDB-backed VFS via Dexie
- Seeds default tree on first boot: `/`, `/home`, `/home/user`, `/apps`, `/system`, plus a sample `notes.md`
- Operations: `readFile`, `writeFile`, `list`
- Emits `filesystem.read` / `filesystem.changed` kernel events

### `@devos/ui`

Shared headless component library:
- `Button`, `Input`, `Badge`, `Spinner`
- `ScrollArea` (Radix)
- `ContextMenu` (Radix)
- `Tooltip` (Radix)
- `cn()` utility (`clsx` + `tailwind-merge`)

### `apps/web` — Desktop Shell

The main visual layer, built with Next.js 16 + Tailwind CSS 4 + Framer Motion.

#### Desktop Shell Components (`src/components/desktop/`)

| Component | Status | Notes |
|---|---|---|
| `Desktop.tsx` | ✅ Done | Root desktop surface, context menu |
| `WindowManager.tsx` | ✅ Done | Renders all open windows from store |
| `AppWindow.tsx` | ✅ Done | Full-featured window chrome (drag, resize, min/max/close) |
| `DynamicApp.tsx` | ✅ Done | Lazy-loads apps via `next/dynamic`, `devos.` prefix normalisation |
| `Taskbar.tsx` | ✅ Done | App launcher, running apps strip, system tray, clock |

#### Taskbar Sub-components (`src/components/taskbar/`)
- `AppLauncherButton.tsx` — opens apps
- `RunningApps.tsx` — taskbar buttons for open windows
- `Clock.tsx` — live clock
- `SystemTray.tsx` — tray area

#### Standalone component
- `src/components/window.tsx` — alternative lightweight window component using `react-rnd` directly (may be a legacy / experimental version)

#### Zustand Stores (`src/stores/`)
- `windowStore`, `processStore`, `notificationStore`, `preferencesStore`, `systemStore`
- All re-exported from `src/stores/index.ts`

### Built-in Apps (`src/apps/`)

| App | Status | Notes |
|---|---|---|
| `terminal` | 🟡 Scaffold | Registered in DynamicApp registry |
| `editor` | 🟡 Scaffold | Static file tree + placeholder editor area |
| `explorer` | 🟡 Scaffold | Registered in DynamicApp registry |
| `api-tester` | 🟡 Scaffold | Registered in DynamicApp registry |
| `git-client` | 🟡 Scaffold | Shows hardcoded "main (up to date)" |
| `settings` | 🟡 Scaffold | Registered in DynamicApp registry |

All apps are lazy-loaded (SSR disabled). The `DynamicApp` router normalises `devos.terminal` → `terminal`.

### `apps/api` — Backend

- NestJS scaffold only
- Has a default `AppController` / `AppService` / `AppModule`
- Builds cleanly, no real functionality yet

---

## What's Next / Not Done

- [ ] **App content** — All 6 built-in apps are stubs; need real implementations
  - `terminal` — xterm.js integration, shell-like command parser
  - `editor` — Monaco or CodeMirror, wired to VFS
  - `explorer` — file tree browser wired to VFS
  - `api-tester` — HTTP client UI (Postman-like)
  - `git-client` — git status viewer (likely server-side via API)
  - `settings` — preferences panel wired to `preferencesStore`
- [ ] **Window ↔ App wiring** — `window.tsx` currently renders `"Mounting {appId}..."` placeholder; `DynamicApp` needs to be mounted inside the window content area
- [ ] **Process ↔ Window lifecycle wiring** — `processStore` and `windowStore` exist but aren't yet cross-linked (opening a window doesn't spawn a process, closing a window doesn't kill a process)
- [ ] **Kernel boot sequence** — No `boot()` entrypoint that registers the VFS service with the `ServiceRegistry` and initialises it
- [ ] **AI subsystem** — `ai.query` / `ai.response` events defined but no handler
- [ ] **API backend** — NestJS is a blank scaffold; no real routes
- [ ] **Auth** — Not started
- [ ] **Notifications UI** — `notificationStore` exists but no toast/notification panel renders
- [ ] **Context menu on desktop** — Shell is in place but menu items likely don't open apps yet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| UI primitives | Radix UI, Framer Motion, react-rnd, Lucide |
| State | Zustand 5 |
| Filesystem | Dexie (IndexedDB) |
| Backend | NestJS 11 |
| Language | TypeScript 5.9 throughout |
