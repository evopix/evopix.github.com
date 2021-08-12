#!/bin/bash

if [ $# -ne 1 ]; then
    echo "usage: ./publish.sh \"commit message\""
    exit 1;
fi

git stash

docker-compose run sculpin npx encore production
docker-compose run sculpin vendor/bin/sculpin generate --env=prod

git checkout master

cp -R output_prod/* .
rm -rf output_*

git add *
git commit -m "$1"

git checkout sculpin
git stash pop