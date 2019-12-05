#!/bin/bash
set -e
rm -rf server/dist/**

npm --prefix server install
npm --prefix server run build

npm --prefix www install
npm --prefix www run build

cp www/build server/dist/www_build
