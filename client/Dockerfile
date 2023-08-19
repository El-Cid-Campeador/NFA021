FROM node:18-alpine

WORKDIR /usr/src/app/client

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 5173

RUN npm run build

CMD [ "npm", "run", "dev" ]
