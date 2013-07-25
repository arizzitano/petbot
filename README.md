PETBOT
======

The car is controlled by a radio transmitter wired to a Raspberry Pi running a local node.js server. Commands are sent via socket.io through a web UI & second node.js server hosted remotely on Heroku. The local server connects to the remote server as a socket.io client, thus allowing commands to be sent to the Pi from anywhere in the world with very low latency.

Resistance is futile.


HOW TO
======

We recently overhauled PETBOT's local server and still need to write up the run process! Currently, it's only set up to run on Raspberry Pi but we have successfully run it on Arduino in the past, and just need to update the Arduino module. As for building the physical robot itself, we're hoping to get a parts spec and 3D model into this repo so anyone can build their own PETBOT.


TODO
----

* Write up run process.
* Add a parts spec and circuit diagram to this repo.
* Experiment with different sized wheels, axles, springs, and shocks to create a sturdier chassis.
* Hook PETBOT into HipChat.
* Update Arduino module.
* Eventually, use a single (rechargeable) power source for the car and the Pi. Maybe even the iPad too!
* Figure out a way to accurately measure speed
* Store a map of the office and use dead reckoning to let PETBOT know where it is at any time. This will enable autonomy - users will be able to tell PETBOT to go visit certain areas, rather than controlling it manually.
* Enable PETBOT to feel love.
