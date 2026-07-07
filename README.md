# Wiki Dashboard

A minimal full-stack starter with:
- **Client** — React 18 + TypeScript + Vite + TailwindCSS (port 5173)
- **Server** — Node.js + Express + TypeScript (port 5000)

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## Getting started

### 1. Install dependencies

**Server**
```bash
cd server
npm install
```

**Client**
```bash
cd client
npm install
```

---

### 2. Run in development

Open **two terminals**:

**Terminal 1 — server**
```bash
cd server
npm run dev
```
The API is available at `http://localhost:5000`.

**Terminal 2 — client**
```bash
cd client
npm run dev
```
The app is available at `http://localhost:5173`.

> All `/api/*` requests from the client are automatically proxied to the server via Vite's dev-server proxy — no CORS issues.

---

### 3. Health check

```
GET http://localhost:5000/api/health
→ { "status": "ok" }
```

---

## Project structure

```
wiki-dashboard/
├── client/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css     # Tailwind directives
│   ├── index.html
│   ├── vite.config.ts    # Proxy + port config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/               # Express + TypeScript
│   ├── src/
│   │   └── index.ts      # Express entry point
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Build for production

**Server**
```bash
cd server
npm run build    # compiles to server/dist/
npm start
```

**Client**
```bash
cd client
npm run build    # outputs to client/dist/
```
