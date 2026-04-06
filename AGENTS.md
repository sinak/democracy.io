# AGENTS.md

## Current Status

This repo is in the middle of a frontend and backend migration.

- The legacy Angular app is still the production web app.
- The newer stack is the active migration target: React in `frontend/` and the newer TypeScript backend in `backend/`.
- The new React app is currently available at `staging.democracy.io`.
- Unless a task explicitly says otherwise, new LLM-authored changes should go into the new stack, not the old Angular or legacy server code.

## Repo Layout

### New app

- `frontend/`: new React + TypeScript + Vite frontend
- `frontend/src/`: application source
- `frontend/src/pages/`: page-level flow screens
- `frontend/src/components/`: shared UI pieces
- `frontend/src/context/`: shared React state
- `frontend/src/hooks/`: React hooks
- `frontend/src/helpers/`: frontend utilities
- `frontend/src/styles/`: Sass styles
- `frontend/public/`: static assets copied by Vite

### New backend

- `backend/`: newer TypeScript backend
- `backend/src/routes/`: Express routes for the newer API
- `backend/src/services/`: integrations and service-layer code
- `backend/src/helpers/`: backend helpers

### Legacy app

- `www/`: legacy Angular frontend that is still live in production
- `www/js/`: Angular controllers, services, directives, and helpers
- `www/partials/`: Angular templates
- `www/sass/`: legacy frontend styles

### Legacy server and shared code

- `server/`: older Express server code, API handlers, and dust templates
- `models/`: shared model definitions used by older server code
- `config/`: runtime configuration for the legacy server stack
- Root `package.json`, `gulpfile.js`, and `gulp/`: legacy build and dev tooling

## Working Rules

- Default to editing `frontend/` for UI work.
- Default to editing `backend/` for API work in the newer stack.
- Prefer `server/` only when the task is specifically about the legacy production stack or shared behavior that has not been migrated yet.
- Do not make routine feature changes in `www/` unless the task is specifically about the legacy production Angular app.
- Treat `frontend/dist/`, `backend/dist/`, and `node_modules/` as generated output and do not edit them directly.

## Practical Rule of Thumb

If a request is about new product work, migration work, staging behavior, or anything an LLM is adding, it should usually land in the new stack under `frontend/` or `backend/`.
