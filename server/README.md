Democracy.io Server
================

# Directory structure

- [**<code>middleware</code>**](/server/middleware) - middleware used by the app
- [**<code>routes</code>**](/server/routes) - route definitions for API and app routes. API routes are organized by API structure, so the legislator/A00001/message endpoint would resolve to a handler in [routes/api/legislator/{bioguideId}/message.js](/server/routes/api/legislator/{bioguideId}/message.js)
- [**<code>services</code>**](/server/services) - common services used by the app, mostly 3rd party API wrappers
- [**<code>templates</code>**](/server/templates) - dust templates for the app

# App Components

## [Middleware](/server/middleware)

- [**<code>api-response</code>**](/server/middleware/api-response.js) - provides helper methods for sending standard JSend style error and data responses from the API
- [**<code>ip-throttle</code>**](/server/middleware/ip-throttle.js) - throttles requests to the message endpoint by IP
- [**<code>ng-xsrf</code>**](/server/middleware/ng-xsrf.js) - pushes the XSRF token into a header, so that Angular can pick it up automatically 
- [**<code>swaggerize-wrapper</code>**](/server/middleware/swaggerize-wrapper.js) - wraps swaggerize-express to hook validation errors into the standard error format and fix a bad settings override

## [Services](/server/services)

- [**<code>third-party-apis</code>**](/server/services/third-party-apis) - helpers for interacting with 3rd party APIs, e.g. POTC or SmartyStreets
