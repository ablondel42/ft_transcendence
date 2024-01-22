# syntax=docker/dockerfile:1
#BASE################################################
FROM node:16.14.2-alpine AS dev
ENV	NODE_ENV=development
WORKDIR /app
COPY package-lock.json ./
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
