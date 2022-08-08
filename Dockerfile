# syntax=docker/dockerfile:1
FROM node:16-bullseye
ENV NODE_ENV=production
WORKDIR /app

COPY ["package.json", "package-lock.json*", ".env", "./"]
COPY ["data", "./data"]
COPY ["src", "./src"]
RUN npm ci --omit=dev

CMD [ "npm", "start" ]
