FROM node:8
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY ./ /app
CMD node src/server.js
EXPOSE 4000

FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/examplessl.conf
COPY keepitsafe.conf /etc/nginx/conf.d/
