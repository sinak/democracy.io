Democracy.io FE
================

# Directory structure

- [**<code>img</code>**](/www/img) - app image files
- [**<code>js</code>**](/www/js) - js code; ng controllers, services etc.
- [**<code>sass</code>**](/www/sass) - sass files for app style
- [**<code>partials</code>**](/www/partials) - ng templates, cached via the [gulp/tasks/partials task](/gulp/tasks/partials.js)

# Angular Components

## [Controllers](/www/js/controllers)

- [**<code>address-form</code>**](/www/js/controllers/address-form.js) - Shows a form to enter the user's address 
- [**<code>captcha</code>**](/www/js/controllers/captcha.js) - Shows a form displaying captcha's from reps, allowing the user to solve them and submit their message 
- [**<code>legislator-picker</code>**](/www/js/controllers/legislator-picker.js) - Displays a picker for selecting the reps to write to
- [**<code>message-form</code>**](/www/js/controllers/message-form.js) - Shows a form for writing a message and supplying metadata, e.g. topic, to send to their reps
- [**<code>send-message</code>**](/www/js/controllers/send-message.js) - Wraps the entire message send process and manages some routing logic and state
- [**<code>thanks</code>**](/www/js/controllers/thanks.js) - Shows a thanks dialog and social media links to share the app 

## [Directives](/www/js/directives)

- [**<code>write-to-them-animation</code>**](/www/js/services/write-to-them-animation.js) - Manages a typewriter style animation for the "write to them" title

## [Services](/www/js/services)

- [**<code>api</code>**](/www/js/services/api.js) - API to talk to the dio backend
- [**<code>dio-data</code>**](/www/js/services/dio-data.js) - Session storage wrapper, provides getter / setter access to app data, e.g. user's verified address
- [**<code>models-http-interceptor</code>**](/www/js/services/models-http-interceptor.js) - Middleware to coerce API responses to model objects

## [Helpers](/www/js/helpers)

- [**<code>api</code>**](/www/js/services/api.js) - Helpers for working with the API, e.g. model coercion
- [**<code>message-form</code>**](/www/js/services/message-form.js) - Helpers for working with the message form, mostly parsers to take legislator form elements and build usable data structures for rendering the corresponding form
- [**<code>page-location</code>**](/www/js/services/page-location.js) - Helpers for getting page and location state
