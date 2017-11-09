FROM ubuntu:latest
RUN mkdir -p /opt/slack

RUN apt-get update && apt-get -y install curl sudo git && curl -sL https://deb.nodesource.com/setup_6.x | bash - && apt-get install -y nodejs && npm install -y -g nodemon

COPY ./package.json /opt/slack
COPY ./index.js /opt/slack
RUN cd /opt/slack/ && npm install

EXPOSE 3000

CMD nodemon -w /opt/slack /opt/slack/index.js 2>&1
