#!/usr/bin/env bash

mkdir build
cp local.html build/index.html

bash $PWD/bin/setup-docker.sh games
if [ $? != 0 ]
then
    >&2 echo "[installer] no $target_docker_name docker-machine running"
    exit 1
fi

echo "[installer] Building docker containers"
eval $(docker-machine env games)

DOCKER_IP=`docker-machine ip games`

if [ -z "$DOCKER_IP" ]
then
    >&2 echo "Looks like we did not the correct docker-machine set up"
    exit 1
fi

echo "[installer] Installing hooks"
bash $PWD/bin/install-git-hooks.sh

echo "[installer] Building docker containers"

docker-compose build

echo "[installer] Installing node modules"
docker-compose run --rm node npm install
docker-compose run --rm node npm rebuild node-sass

cat <<EOF
[installer] Completed!

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!                                                    !!
!!  You're all set and ready to go.  In order to hit  !!
!!  games-local.changemyworldnow.com, you need to add !!
!!  the following to your /etc/hosts file:            !!
!!                                                    !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

$DOCKER_IP    games-local.changemyworldnow.com

You then run:
docker-compose up -d
and you will be able to access the site locally in the browser

Happy Coding!

EOF
