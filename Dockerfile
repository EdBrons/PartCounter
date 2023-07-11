FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# RUN npm ci --omit=dev
COPY . .
EXPOSE 8080
# CMD [ "npm", "run", "build:prod" ]
CMD [ "npx", "run", "server:start:prod" ]