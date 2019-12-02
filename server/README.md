Democracy.io Server
================

# Directory structure

- [**<code>middleware</code>**](/server/middleware) - middleware used by the app
- [**<code>routes</code>**](/server/routes) - route definitions for API and app routes. API routes are organized by API structure, so the legislator/A00001/message endpoint would resolve to a handler in [routes/api/legislator/{bioguideId}/message.js](/server/routes/api/legislator/{bioguideId}/message.js)
- [**<code>services</code>**](/server/services) - common services used by the app, mostly 3rd party API wrappers
- [**<code>templates</code>**](/server/templates) - dust templates for the app

# App Components

## [Services](/server/services)

- [**<code>third-party-apis</code>**](/server/services/third-party-apis) - helpers for interacting with 3rd party APIs, e.g. POTC or SmartyStreets
