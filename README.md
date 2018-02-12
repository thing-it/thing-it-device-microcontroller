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


## User Interface

The appearance of the UI of the Microcontroller Plugin on the [thing-it] Mobile Client depends on the configured Actors and Sensors

## Actors
#### LED

#### RGB LED

#### Addressable LED (WS2812B)
The Pixel Actor only works with Arduino as Microcontroller and requires a custom version of the Arduino Firmata. Installation instructions can be found [here](https://github.com/ajfisher/node-pixel/blob/master/docs/installation.md).


#### Button

#### Servo

#### LCD

#### Photocell

#### Potentiometer

#### Relay

## Sensors

#### Light Sensor
**Note:** Light sensor uses i2c interface.
For Microcontroller Typ: Raspberry PI this must be activated first via sudo raspi-config -> interfaces


**Connection:**

| Raspberry Pi pin (function)  |  TSL2564/BH1750|
|---|---|
| 6/9/14/20/25/30/34 (GND)|GND|
| 1/17 (3.3V)  |VCC|
| 5 (SCL)|SCL|
| 3 (SDA)|SDA|


#### Air Quality Sensor
**Note:** AirQuality sensor uses i2c interface.
For Microcontroller Typ: Raspberry PI this must be activated first via sudo raspi-config -> interfaces


**Connection:**

| Raspberry Pi pin (function)  |  AirQuality|
|---|---|
| 6/9/14/20/25/30/34 (GND)|GND|
| 1/17 (3.3V)  |VCC|
| 5 (SCL)|SCL|
| 3 (SDA)|SDA|

Once I2C is enabled, we need to slow the speed way down due to constraints of this particular sensor.

via
```
sudo nano /boot/config.txt
```

add this line to the file

```
dtparam=i2c_baudrate=10000
```

safe and reboot