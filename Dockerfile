FROM node:22.11.0

WORKDIR /app

COPY package*.json /app

RUN npm i

COPY ./ ./app

EXPOSE 3000

CMD [ "sh", "-c", "npm run build && npm start" ]