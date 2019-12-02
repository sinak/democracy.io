#!/bin/bash
rm -rf www/dist/**
rm -rf server/dist/**

npm --prefix server install
npm --prefix server run build

npm --prefix www install
npm --prefix www run build

cp www/dist server/dist/static
