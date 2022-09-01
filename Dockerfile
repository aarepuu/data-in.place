# Start with a node 14 image with package info
# Installs *all* packages and runs build script
FROM node:14-alpine as build-stage
RUN apk update && apk add --no-cache bash git openssh yarn
WORKDIR /app
COPY [ ".", "/app/" ]
RUN yarn install
RUN yarn build

# startup and copy the sources
FROM nginx:1-alpine as production-stage
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf     
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
