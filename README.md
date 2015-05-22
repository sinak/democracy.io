Democracy.io
============

Express & Angular app for sending messages to Senate and House members

## Table of Contents

* [Background Info](#background-info)
* [Getting Started](#getting-started)
* [App Configuration](#app-configuration)
* [Run tests](#run-tests)
* [Running the server](#running-the-server)
* [Angular App](#angular-app)

## Background Info

Democracy.io is an app for contacting Senate & House members. It provides a user friendly wrapper around the individual member contact forms.

It uses APIs from:
* [Sunlight Foundation](https://sunlightlabs.github.io/congress/)
* [Smarty Streets](https://smartystreets.com/docs)
* [Phantom of the Capitol](https://github.com/EFForg/phantom-of-the-capitol)

## Getting started

### Redis 

Ensure that redis is running locally: http://redis.io/topics/quickstart

### App dependencies & build

```
npm install
gulp build
```

## App Configuration

App config is controlled via the [node-config](https://github.com/lorenwest/node-config) module.

To set credentials, create a local.json file under the [config dir](/config) and override the SERVER.CREDENTIALS setting.

Alternately, you can use:
* [Environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables)
* [Command line options](https://github.com/lorenwest/node-config/wiki/Command-Line-Overrides)

## Run tests

```
gulp test
```

## Running the server

Spins up a local server to serve the app.

```
gulp serve
```

## Angular app

See the [www/README.md](/www/README.md) for details
