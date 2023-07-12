FROM node:18

WORKDIR /usr/src/app

RUN apt-get update || : && apt-get install ffmpeg libsm6 libxext6 python3 python3-venv python3-pip -y

RUN python3 -m venv venv

COPY . .

RUN ./venv/bin/pip install -r requirements.txt

COPY package*.json ./

RUN npm install

RUN npm run build:dev

COPY ./dist .

EXPOSE 8080
CMD [ "npm", "run", "server:start:prod" ]