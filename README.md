PETBOT
======

PETBOT (Providence Engineering Telepresence roBOT) is a telepresence robot consisting of an iPad mounted on a lightweight chassis around an RC car. The car is controlled by a radio transmitter wired to an Arduino, which is controlled by a local node.js server over USB. Commands are sent via socket.io through a web UI & second node.js server, hosted remotely on Heroku. The local server connects to the remote server as a socket.io client, thus allowing commands to be sent to the Arduino from anywhere in the world with very low latency.

Resistance is futile.
