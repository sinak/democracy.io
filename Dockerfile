FROM node:7.5.0

COPY package.json /tmp/package.json
RUN cd /tmp \
  && npm install \
  && mkdir -p /opt/democracy.io \
  && cp -a /tmp/node_modules /opt/democracy.io/

ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/democracy.io/node_modules/.bin
WORKDIR /opt/democracy.io

COPY . /opt/democracy.io
COPY ./config/custom-environment-variables.json.example /opt/democracy.io/config/custom-environment-variables.json

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
