FROM waltzofpearls/nodejs

MAINTAINER waltzofpearls <rollie.ma@gmail.com>

ADD bin/docker-image/run /etc/service/tetris/run

WORKDIR /srv/www/tetris

COPY . .

RUN \
    npm install && \
    npm run build && \
    tee config/development.yml \
        config/testing.yml \
        config/production.yml < config/dist.yml

ENV PORT 3000
ENV DEBUG tetris

EXPOSE 3000

CMD ["/sbin/my_init"]
