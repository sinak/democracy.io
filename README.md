Democracy.io
============

React frontend and TypeScript backend for sending messages to members of the U.S. Senate and House of Representatives.

## Repo Layout

- `frontend/`: React + TypeScript + Vite application
- `backend/`: TypeScript + Express API

The backend serves the built frontend from `frontend/dist` in production.

## Prerequisites

- Node.js `22.12.0` or newer
- npm `11` or newer
- A repo-root `.env` file with the backend environment variables you need

## Install

```bash
npm install
```

## Development

Run both apps together:

```bash
npm run dev
```

That starts:

- the backend on `http://localhost:3001`
- the Vite frontend on `http://localhost:3000`

You can also run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Build

```bash
npm run build
```

This builds:

- `frontend/dist`
- `backend/dist`

## Frontend Telemetry

Set `VITE_CLARITY_PROJECT_ID` at frontend build time to enable Microsoft Clarity session diagnostics in the Vite frontend. Leave it unset to disable Clarity.

## Production

```bash
npm run start
```

The backend serves the compiled frontend and API from the same process. It listens on `PORT`, which defaults to `3001`.
