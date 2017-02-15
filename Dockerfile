FROM node:7.5.0

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/democracy.io && cp -a /tmp/node_modules /opt/democracy.io/
ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/democracy.io/node_modules/.bin

WORKDIR /opt/democracy.io

COPY . ./

RUN npm run build:prod

CMD ["node", "server.js"]
