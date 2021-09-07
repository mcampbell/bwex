# Adapted from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# Not much to this; from node, copy package stuff into the image, run npm install on it,
# then copy the JS source into the image, and run it on a hardcoded port.

FROM node:16.8

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
