#!/bin/sh

if [ "$(echo $NODE_ENV | tr '[:upper:]' '[:lower:]')" = "production" ]; then
    npm run build:prod
    git rev-parse HEAD >.build/revision
fi


exec "$@"
