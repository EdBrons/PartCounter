FROM node:18

WORKDIR /usr/src/app

RUN apt-get update || : && apt-get install ffmpeg libsm6 libxext6 python3 python3-venv python3-pip -y

RUN python3 -m venv venv

# RUN . venv/bin/activate
COPY . .

RUN ./venv/bin/pip install -r requirements.txt

COPY package*.json ./

RUN npm install

EXPOSE 8080
CMD [ "npm", "run", "server:start:prod" ]