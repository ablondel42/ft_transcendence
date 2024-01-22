# syntax=docker/dockerfile:1
FROM node:16.14.2-alpine AS dev
ENV	NODE_ENV=development
WORKDIR /frontend
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn", "start"]
