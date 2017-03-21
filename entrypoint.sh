#!/bin/bash

if [ "$(tr '[:upper:]' '[:lower:]' <<<"$NODE_ENV")" = "production" ]; then
    npm run build:prod
    git rev-parse HEAD >.build/revision
fi


exec "$@"
