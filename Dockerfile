# Dockerfile-web
# Start with a node 12 image with package info
# Installs *all* npm packages and runs build script
FROM node:8.9-alpine as base
RUN apk --no-cache add git
WORKDIR /app
COPY ["package*.json","bower.json", ".bowerrc", "/app/"]
ENV NODE_ENV production
RUN npm i
RUN node_modules/bower/bin/bower install

# [1] A builder to install all dependancies and run the build
FROM base as prod
COPY [ ".", "/app/" ]
EXPOSE 3000
# RUN npm run build -s
CMD node server/index.js