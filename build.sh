#!/bin/bash
set -e
echo "build.sh - starting production build"

echo "build.sh - deleting server/dist"
rm -rf server/dist/**

echo "build.sh - installing deps"
# set loglevel to silence npm postinstall advertisers
npm --prefix server --loglevel=error ci
npm --prefix www --loglevel=error ci


echo "build.sh - building"
npm --prefix server run build
npm --prefix www run build

echo "build.sh - copying www/build to server/dist/www_build"
cp -R www/build server/dist/www_build

echo "build.sh - finished"
