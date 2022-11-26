#!/bin/sh

docker \
    run \
    -it \
    --rm \
    --volume="$PWD":/usr/src/app \
    -w /usr/src/app \
    -u "node" \
    pgetinker-nodejs \
    npm \
    $@
