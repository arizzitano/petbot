PETBOT
======

PETBOT (Providence Engineering Telepresence roBOT) is a telepresence robot consisting of an iPad mounted on a lightweight chassis around an RC car. The car is controlled by a radio transmitter wired to an Arduino, which is controlled by a local node.js server over USB. Commands are sent via socket.io through a web UI & second node.js server, hosted remotely on Heroku. The local server connects to the remote server as a socket.io client, thus allowing commands to be sent to the Arduino from anywhere in the world with very low latency.

Resistance is futile.

Requirements
------------

* Mac OS X 10.8+ (didn't really work with 10.7, failed miserably with Windows 7, haven't tried on Linux)
* XCode
* npm
* Arduino (Duemilanove was used in my implementation)
* Arduino software and drivers
* Supplies to build robot -- most importantly a cheap, sturdy RC car.

Installation & Setup
--------------------

```
$ git clone git@github.com:arizzitano/petbot.git
$ cd petbot
$ npm install
```

Now open up the Arduino software and load petbot/node_modules/duino/src/dui.no. It might ask if you want to create a folder for the file, go ahead and do that. Connect your Arduino over USB and upload the file! Now:

```
$ node local/arduino.js
```

Visit the web interface and hit a few arrow keys. You should see these commands reflected in your terminal!


TODO
----

* Add a parts spec and circuit diagram to this repo.
* Genericize code for remote server & remove references to our web address.
* Queue user connections to the web interface so only one person can use it at a time and everyone gets a turn.
* Port local server & low-level pin communications to Raspberry Pi/GPIO.
* Experiment with different sized wheels, axles, springs, and shocks to create a sturdier chassis.
* Move battery pack outside the car to enable easier charging.
* Mount police light on top of PETBOT.
* Hook PETBOT into HipChat.
* Eventually, use a single (rechargeable) power source for the car and the Pi. Maybe even the iPad too!
* Figure out a way to accurately measure speed
* Store a map of the office and use dead reckoning to let PETBOT know where it is at any time. This will enable autonomy - users will be able to tell PETBOT to go visit certain areas, rather than controlling it manually.
* Enable PETBOT to feel love.
