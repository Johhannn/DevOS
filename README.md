<p align="center">
  <img src="https://img.shields.io/badge/DevOS-v0.1.0-6366F1?style=for-the-badge&labelColor=0B0F19" alt="DevOS Version" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Turborepo-2-EF4444?style=for-the-badge&logo=turborepo" alt="Turborepo" />
</p>

<h1 align="center">🖥️ DevOS</h1>

<p align="center">
  <strong>A browser-based Developer Operating System</strong><br/>
  <sub>Build, code, test, and deploy — all from a single browser tab.</sub>
</p>

---

## 🧠 What is DevOS?

**DevOS** is a full-featured operating system environment that runs entirely in the browser. It provides a desktop-style interface with floating, draggable windows where developer tools — Terminal, Code Editor, API Tester, Database Explorer — run as native-feeling applications.

Think of it as **VS Code meets a Linux desktop**, but it lives in your browser and is fully extensible.

### ✨ Core Features (MVP)

- 🪟 **Floating Window Manager** — Drag, resize, minimize, maximize, and focus windows
- 📁 **Virtual File System** — IndexedDB-backed persistent storage with Unix-like paths
- 🧬 **Kernel Architecture** — Event bus, service registry, and process lifecycle management
- 🎨 **Custom Design System** — Dark-themed UI components built on Radix UI + Tailwind
- ⚡ **Taskbar & Desktop Shell** — Real-time clock, system metrics, and app launcher
- 🐳 **Docker-Ready Backend** — NestJS API with PostgreSQL and Redis

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    DevOS Shell                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Terminal  │  │  Editor  │  │   API Tester     │  │
│  │  (xterm)  │  │ (Monaco) │  │   (HTTP client)  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│─────────────────────────────────────────────────────│
│              Window Manager (react-rnd)              │
│─────────────────────────────────────────────────────│
│     Kernel: EventBus │ ServiceRegistry │ Store       │
│─────────────────────────────────────────────────────│
│         Virtual File System (Dexie / IndexedDB)      │
└─────────────────────────────────────────────────────┘
         │                              │
    ┌────┴────┐                   ┌─────┴─────┐
    │ Next.js │                   │  NestJS   │
    │ Frontend│                   │  Backend  │
    └─────────┘                   └───────────┘
                                       │
                              ┌────────┼────────┐
                              │  PostgreSQL  │  Redis  │
                              └──────────────┴─────────┘
```

---

## 🗂️ Project Structure

```
devos/
├── apps/
│   ├── web/                 # Next.js 16 App Router (frontend)
│   │   ├── src/
│   │   │   ├── app/         # Next.js routes & layouts
│   │   │   └── components/  # Desktop, Taskbar, WindowManager
│   │   ├── tailwind.config.ts
│   │   └── next.config.ts
│   └── api/                 # NestJS 10 backend
│       └── src/             # Controllers, services, modules
├── packages/
│   ├── kernel/              # Core OS kernel
│   │   ├── core.ts          # CoreKernel orchestrator
│   │   ├── events.ts        # EventBus (pub/sub + middleware)
│   │   ├── registry.ts      # ServiceRegistry (DI container)
│   │   └── store.ts         # Zustand state (processes + windows)
│   ├── filesystem/          # Virtual File System
│   │   ├── db.ts            # Dexie.js IndexedDB schema
│   │   └── vfs.ts           # VFS service (read, write, list)
│   ├── ui/                  # Shared component library
│   │   └── src/components/  # Button, Input, Badge, Tooltip, etc.
│   └── types/               # Shared TypeScript interfaces
├── infra/
│   └── docker/
│       └── docker-compose.yml  # PostgreSQL 16 + Redis 7
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # pnpm workspace definition
└── tsconfig.base.json       # Shared TypeScript config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** (optional, for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/Johhannn/DevOS.git
cd DevOS

# Install dependencies
pnpm install
```

### Development

```bash
# Start the frontend dev server
pnpm dev

# The app will be available at http://localhost:3000
```

### Backend Services (optional)

```bash
# Start PostgreSQL and Redis via Docker
cd infra/docker
docker-compose up -d

# Start the NestJS API
pnpm --filter api run start:dev
```

---

## 🎨 Design System

DevOS uses a custom dark-mode design system with carefully selected tokens:

| Token      | Color     | Usage                    |
|------------|-----------|--------------------------|
| `desktop`  | `#0B0F19` | Main desktop background  |
| `panel`    | `#111827` | Panels, sidebars         |
| `window`   | `#1F2937` | Window chrome            |
| `surface`  | `#374151` | Elevated surfaces        |
| `accent`   | `#6366F1` | Primary accent (indigo)  |
| `accent2`  | `#06B6D4` | Secondary accent (cyan)  |
| `success`  | `#10B981` | Success states           |
| `warning`  | `#F59E0B` | Warning states           |
| `danger`   | `#EF4444` | Error states             |

**Fonts:** Inter (UI) · JetBrains Mono (Code)

### UI Components (`@devos/ui`)

| Component      | Description                                        |
|----------------|----------------------------------------------------|
| `Button`       | 4 variants (default, ghost, danger, icon) · 3 sizes |
| `Input`        | Labels, error messages, prefix/suffix icons         |
| `ContextMenu`  | Radix-based with destructive variant               |
| `Tooltip`      | Dark styled with configurable delay                |
| `Badge`        | 5 variants (default, success, warning, danger, ghost)|
| `ScrollArea`   | Custom thin scrollbar matching DevOS theme         |
| `Spinner`      | Animated loading indicator · 3 sizes               |

---

## 🛠️ Tech Stack

| Layer      | Technology                                         |
|------------|-----------------------------------------------------|
| Frontend   | Next.js 16, React, TypeScript, Tailwind CSS        |
| State      | Zustand (vanilla + React bindings)                  |
| UI         | Radix UI, Framer Motion, Lucide Icons              |
| Windows    | react-rnd (drag & resize)                           |
| Storage    | Dexie.js (IndexedDB wrapper)                        |
| Backend    | NestJS 10, PostgreSQL 16, Redis 7                  |
| Monorepo   | Turborepo, pnpm workspaces                         |
| Realtime   | Socket.IO (planned)                                |

---

## 📋 Roadmap

- [x] **Phase 1A** — Monorepo scaffold, Kernel, VFS, Desktop Shell
- [x] **Phase 1B** — Shared UI component library
- [ ] **Phase 2** — Terminal app (xterm.js), App manifest loader
- [ ] **Phase 3** — Code Editor (Monaco), File Explorer
- [ ] **Phase 4** — API Tester, Database Explorer
- [ ] **Phase 5** — Authentication, real-time collaboration

---

## 📦 Scripts

| Command                    | Description                          |
|----------------------------|--------------------------------------|
| `pnpm dev`                 | Start all apps in development mode   |
| `pnpm build`               | Build all apps for production        |
| `pnpm lint`                | Lint all packages                    |
| `pnpm --filter web dev`    | Start only the frontend              |
| `pnpm --filter api start:dev` | Start only the backend            |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Johhannn">Johhannn</a></sub>
</p>
