## Needed for working server:

- Redis
- Node.js
- npm
- git
- process manager (e.g. [forever](https://github.com/foreverjs/forever))
- logging (forever handles this if we use it), and some sort of log cycling (maybe `logrotate`)

## Tasks on deploy:

- Clone the repo.
- Set environment variable NODE_ENV to `production`
- `local.json` file needs to exist in the `/config` folder that contains the app credentials.
- `npm install`
- `npm run build` (builds static assets)
- `npm run test` (to run tests) 
- start the app using process manager (which should be set up to call `node server.js`)


