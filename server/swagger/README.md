Democracy.io Swagger
============

DIO defines its API using Swagger. As it's reasonably large, it's annoying to manage in a single file, so is split into:
* [models](models): Contains model definitions for each object the API acts on
* [paths](paths): Contains path definitions for each API endpoint


DIO uses a custom gulp [task](../../gulp/tasks/swagger.js) to resolve $ref entries in the main api.json file. This is to provide a better generated docs experience while still preserving modularity in the API defs.
