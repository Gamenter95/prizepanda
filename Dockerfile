FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV CLIENT_DIST=client/dist

CMD ["node", "server/dist/index.js"]
