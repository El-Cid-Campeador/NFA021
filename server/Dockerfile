FROM node:18-alpine

ENV NODE_ENV=development

WORKDIR /usr/src/app/server

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]
