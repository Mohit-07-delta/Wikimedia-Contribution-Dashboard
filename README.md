# Wikimedia Contribution Dashboard

A minimalist dashboard to view user contribution statistics across Wikimedia projects (Wikipedia, Wikidata, etc.).

## Project Structure

- `/client` - React + Vite frontend styled to match the Wikipedia Vector 2022 skin.
- `/server` - Express + TypeScript backend that proxies requests to the XTools and MediaWiki APIs.

## Local Development

### Server
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### Client
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173` and will proxy `/api` requests to the local server.

---

## Deployment Guide

Do **not** deploy these to the same host using a single build command unless using a monorepo setup (like Railway for both). The easiest free setup is Vercel for the client and Render/Railway for the server.

### 1. Deploy the Backend (Server)

You can deploy the backend to a free service like Render or Railway.

**Environment Variables Required:**
- `PORT`: (Usually provided automatically by the host, e.g., 5000)
- `CLIENT_URL`: The production URL of your frontend once deployed (e.g., `https://your-wiki-dashboard.vercel.app`). This is used to configure CORS. (See `server/.env.example`)

**Render Deployment Steps:**
1. Create a new Web Service on Render and connect your GitHub repo.
2. Root Directory: `server`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add the environment variables under the "Environment" tab.
6. Deploy. Note your live server URL (e.g., `https://wiki-dashboard-api.onrender.com`).

### 2. Deploy the Frontend (Client)

You can deploy the frontend to Vercel easily. The project already includes a `vercel.json` file for client-side routing.

**Vercel Deployment Steps:**
1. Connect your GitHub repo to Vercel.
2. Root Directory: `client`
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. **Important:** Before deploying, update the `/api` proxy logic. Since Vercel won't run the backend, you need to change your fetch calls in `DashboardPage.tsx` from relative URLs (`/api/...`) to absolute URLs pointing to your deployed backend (e.g., `https://wiki-dashboard-api.onrender.com/api/...`), or define an environment variable for the API base URL.
7. Deploy.
