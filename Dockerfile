FROM node:13.8-alpine as base

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production && yarn cache clean


FROM base as prod
ENV NODE_ENV=production
WORKDIR /app

USER node
COPY . .
ENV PORT=3000
EXPOSE 3000

CMD ["node", "/app/src/index.js"]


FROM base as test
ENV NODE_ENV=test
WORKDIR /app

RUN yarn install --development && yarn cache clean

COPY . .

CMD ["yarn", "ci:test"]

