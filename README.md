# D3 Data Visualization

This project is a full-stack application for data visualization using D3.js, React, and a Node.js/Express backend.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Project Structure

- `client/` — Frontend React application (Vite + TypeScript)
- `server/` — Backend Node.js/Express API

## Getting Started

### 1. Install Dependencies

Open a terminal in the project root and run:

```powershell
cd client
npm install
cd ../server
npm install
```

### 2. Start the Backend Server

In the `server` directory, run:

```powershell
npm run dev
```

The backend will start (default: http://localhost:3001).

### 3. Start the Frontend

Open a new terminal, go to the `client` directory, and run:

```powershell
npm run dev
```

The frontend will start (default: http://localhost:5173).

### 4. Open the App

Visit [http://localhost:5173](http://localhost:5173) in your browser. The frontend will communicate with the backend API.

## Development Notes

- The backend serves data from JSON files in `server/src/data/`.
- The frontend uses Vite for fast development and hot reloading.

## Scripts

- `npm run dev` — Start development server (both client and server)
- `npm run build` — Build for production (client only)

## Troubleshooting

- Ensure both client and server are running on their respective ports.
- If ports are in use, update them in `vite.config.ts` (client) or `src/app.ts` (server).

## License

MIT
