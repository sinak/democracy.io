# Democracy.io Server

- Serves API endpoints under `/api`
- Serves [React app](../www) under `/`

## Scripts

**Development**

- `npm run watch` - Starts server on port **3000** and restarts the server whenever files are changed. This does **not** build the React app.

**Tests**

- `npm run test` - Runs all tests
- `npm run test-fast` - Runs all tests excluding test files named `slow.test.*` which are long running tests e.g. pulling real data sources instead of mocks

## Directory structure

- **src/datasets** - code for parsing datasets and transforming into internal interfaces
- **src/legislators** - In-memory database of legislator data
- **src/routes** - API routes
- **src/services** - External API's
