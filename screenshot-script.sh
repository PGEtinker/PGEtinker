#!/bin/sh

docker \
    run \
    --rm \
    --volume="$PWD":/usr/src/app \
    -w /usr/src/app \
    -u "node" \
    pgetinker-nodejs \
    node \
    screenshot.js $1
