# AGENTS.md

## Current Status

This repo contains only the current stack:

- React in `frontend/`
- TypeScript + Express in `backend/`

The backend serves `frontend/dist` in production.

## Repo Layout

### Frontend

- `frontend/`: React + TypeScript + Vite frontend
- `frontend/src/`: application source
- `frontend/src/pages/`: page-level flow screens
- `frontend/src/components/`: shared UI pieces
- `frontend/src/context/`: shared React state
- `frontend/src/hooks/`: React hooks
- `frontend/src/helpers/`: frontend utilities
- `frontend/src/styles/`: Sass styles
- `frontend/public/`: static assets copied by Vite

### Backend

- `backend/`: TypeScript backend
- `backend/src/routes/`: Express routes
- `backend/src/services/`: integrations and service-layer code
- `backend/src/helpers/`: backend helpers

## Working Rules

- Default to editing `frontend/` for UI work.
- Default to editing `backend/` for API work.
- Treat `frontend/dist/`, `backend/dist/`, and `node_modules/` as generated output and do not edit them directly.
