# thing-it-device-microcontroller

[![NPM](https://nodei.co/npm/thing-it-device-microcontroller.png)](https://nodei.co/npm/thing-it-device-microcontroller/)
[![NPM](https://nodei.co/npm-dl/thing-it-device-microcontroller.png)](https://nodei.co/npm/thing-it-device-microcontroller/)

[thing-it-node] Device Plugin for Microcontrollers (Arduino Uno and others) as well as GPIO access for Single-board Computers like Raspberry Pi or C.H.I.P.

This allows you to 

* control the Microcontroller configuration over the Internet,
* define complex services, event processing, storyboards and Jobs combining the Microcontroller and its connected Devices, Actors and Sensors with other Devices, Sensors and Actors. 

by means of [thing-it-node](https://github.com/marcgille/thing-it-node) and [thing-it.com](http://www.thing-it.com).

## Installation

After you have 

* [set up](https://github.com/marcgille/thing-it-node/wiki/General-Installation) your [thing-it] Node Box and 
* configured or copied a [thing-it] Mesh with a TI SensorTag, 

connect your microcontroller to your [thing-it] Node Box via a USB cable.


####NOTE!
The Node-Pixel Actor only works with Arduino as Microcontroller and requires a custom version of the Arduino Firmata. Installation instructions can be found [here](https://github.com/ajfisher/node-pixel/blob/master/docs/installation.md).


## User Interface

The appearance of the UI of the Microcontroller Plugin on the [thing-it] Mobile Client depends on the configured Actors and Sensors

### Light Sensor
Light sensor uses i2c interface. This must be activated first via sudo raspi-config -> interfaces

### LED

### RGB LED

### Addressable LED (WS2812B) 

### Button

### Servo

### LCD

### Photocell

### Potentiometer

### Relay