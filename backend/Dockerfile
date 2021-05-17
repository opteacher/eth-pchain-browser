FROM node:latest

WORKDIR /app

COPY package.json /app
RUN  npm install --unsafe-perm=true --allow-root
COPY . /app
RUN npm run build

EXPOSE 4000

CMD [ "npm", "run", "start" ]
