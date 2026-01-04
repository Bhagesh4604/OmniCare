# Omni Care HMS (Frontend + Server)

Quick start:

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start backend server: `npm run server` (starts `node server/index.cjs` on port 8080).
3. Start frontend dev server: `npm run dev` (Vite, default port 5173).

Notes:
- Use `VITE_API_BASE` in `.env` to override the default API base URL (`http://localhost:8080`). The frontend uses `src/config/api.ts` to build endpoints.
- To run lint locally you may need to install dev dependencies and allow PowerShell script execution in your terminal session:

  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
  npm install
  npm run lint
  ```
