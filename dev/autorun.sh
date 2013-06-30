#!/usr/bin/env bash

# depending on your platform, you might need to do something like this:
# sudo apt-get install nodejs nodejs-dev npm

cd "$(dirname "$0")"
cd ..

while :
do
    killall -q petbot_autorun -u $USER
    node dev/autorun.js
    sleep 0.5
done
