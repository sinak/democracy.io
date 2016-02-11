## Server setup
The following need to be installed/configured:

- Redis
- Node.js
- npm
- git
- process manager (e.g. [pm2](https://github.com/Unitech/pm2))
- logging (set up as you wish)
- `local.json` file needs to exist in the `/config` folder and should contain the app credentials.
- Set environment variable NODE_ENV to `production`

##  Deployment

- Pull latest version from repo.
- `npm install` (installs npm modules)
- `npm run build:prod` (builds static assets)
- `npm run test` (runs tests) 
- `pm2 startOrRestart ecosystem.json5 --env production` (restart pm2 process manager in production mode)
- `curl -X PURGE https://democracy.io/static` (purge varnish cache)

# Using pm2's command line tool
The deploy process above is encapsulated in the ecosystem.json5 file, and can be triggered by running:
```
pm2 deploy ecosystem.json5 production
```

