# Democracy.io

[![Build Status](https://travis-ci.org/sinak/democracy.io.svg?branch=master)](https://travis-ci.org/sinak/democracy.io)

Express & React app for sending messages to Senate and House members

## Table of Contents

- [Background Info](#background-info)
- [Development](#development)

## Background Info

Democracy.io is an app for contacting Senate & House members. It provides a user friendly wrapper around the individual member contact forms.

It uses APIs from:

- [Smarty Streets](https://smartystreets.com/docs)
- [Phantom of the Capitol](https://github.com/EFForg/phantom-of-the-capitol)

## Getting started

### Dependencies

- Node.js
- Redis (only required in production)

### Credentials

### Development

In most cases, you probably want to watch for changes and have everything
reload.

**Server**

```
$ cd server
$ npm install
$ npm run watch
```

**React app**

In new terminal tab:

```
$ cd www
$ npm install
$ npm run start
```


## Deploying

To deploy the server, simply run:

```

pm2 deploy ecosystem.json5 production

```

For more instructions on setting up a production server, check [/deployment/README.md](deployment/README.md).

## Angular app

See the [www/README.md](/www/README.md) for details

### Redis

Ensure that Redis is running locally:

```

sudo apt-get install redis-server

```

or install manually via http://redis.io/topics/quickstart - making sure to read the "Securing Redis" section, especially if you install Redis manually.

```

```
