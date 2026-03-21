<div align="center">

```text
  ____            ___  ____  
 |  _ \  _____  _/ _ \/ ___| 
 | | | |/ _ \ \/ / | | \___ \ 
 | |_| |  __/>  <| |_| |___) |
 |____/ \___/_/\_\\___/|____/ 
```

**DevOS is a browser-based Developer Operating System.**<br/>
A full desktop environment for developers that runs in your browser.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[**Live Demo (https://devos.vercel.app)**](https://devos.vercel.app)

</div>

---

## 🌟 Features

- 🖥️ **Desktop environment with floating windows**
- 📁 **Virtual File System backed by IndexedDB**
- 💻 **Terminal with Unix-like commands**
- ✏️ **VS Code-grade code editor (Monaco)**
- 🔌 **API Tester (Postman-like REST client)**
- 🔍 **Command Palette (Ctrl+K)**
- 🤖 **AI Assistant**
- 🎨 **Dark theme with accent customisation**

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Next.js, Tailwind CSS, Zustand, Framer Motion |
| **Backend** | NestJS, TypeORM, Passport.js (GitHub OAuth) |
| **Database** | PostgreSQL, Redis (Rate Limiting) |
| **Real-time** | WebSockets (Socket.io) |
| **Infrastructure** | Turborepo, Docker, Vercel, Railway |

## 🚀 Getting Started

Follow these instructions to run DevOS locally.

```bash
git clone https://github.com/yourusername/devos
cd devos && pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev
```

## 🏗️ Architecture

```text
+-------------------------------------------------------------+
|                     User Interface Layer                    |
|   (Desktop, Window Manager, Taskbar, Apps: Terminal, IDE)   |
+-------------------------------------------------------------+
|                        System Layer                         |
|   (Zustand Stores, Window API, Notification API, Config)    |
+-------------------------------------------------------------+
|                      Virtual Ecosystem                      |
|           (Virtual File System UI, Event Kernel)            |
+-------------------------------------------------------------+
|                      Backend Services                       |
|           (NestJS REST API, AI Proxy, Workspaces)           |
+-------------------------------------------------------------+
|                       Persistence Layer                     |
|     (PostgreSQL Database, Redis Cache, Browser IndexedDB)   |
+-------------------------------------------------------------+
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
