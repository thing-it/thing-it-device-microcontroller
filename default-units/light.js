module.exports = {
    metadata: {
        plugin: "lightSensor",
        label: "Light Sensor",
        role: "sensor",
        family: "lightSensor",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [{
            id: "highThresholdReached",
            label: "High threshold reached"
        }, {
            id: "lowThresholdReached",
            label: "Low threshold reached"
        }],
        state: [{
            id: "luminance",
            label: "Luminance",
            type: {
                id: "number"
            },
        }],
        configuration: [{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "BH1750  (I2C)",
                    id: "BH1750"
                }, {
                    label: "TSL2561 (I2C)",
                    id: "TSL2561"
                }]
            }
        }, {
            label: "Threshold High",
            id: "thresholdHigh",
            type: {
                id: "integer"
            },
            unit: "LUX",
            defaultValue: 180,
        }, {
            label: "Threshold Low",
            id: "thresholdLow",
            type: {
                id: "integer"
            },
            unit: "LUX",
            defaultValue: 60,
        }, {
            label: "Average Time",
            id: "averageTime",
            type: {
                id: "integer"
            },
            unit: "sec",
            defaultValue: 30,
        }]
    },
    create: function () {
        return new LightSensor();
    }
};

/**
 *
 */
function LightSensor() {
    /**
     *
     */
    LightSensor.prototype.start = function () {
        try {
            if (!this.isSimulated()) {

                //this.logLevel = 'debug';

                var five = require("johnny-five");

                this.state = {
                    luminance: 0
                };

                this.lightSensor = new five.Light({
                    controller: this.configuration.controller,
                    freq: 500,
                });

                var value = [];
                var highEvent = false;
                var lowEvent = false;

                var self = this;


                this.lightSensor.on("data", function (data) {
                    value.push(data.lux);

                    if (value.length > self.configuration.averageTime * 2) {
                        value.shift();
                    }

                    let sum = value.reduce(function (a, b) {
                        return (a + b)
                    });

                    let average = Math.round((sum / value.length));

                    if (average !== self.state.luminance) {
                        self.state.luminance = average;
                        self.logDebug("\x1b[36mLuminance: \x1b[0m" + self.state.luminance);
                        self.publishStateChange();
                    }

                    if ((average > self.configuration.thresholdHigh) && !highEvent) {
                        highEvent = true;
                        self.publishEvent('highThresholdReached');
                    }

                    if (average < self.configuration.thresholdHigh) {
                        highEvent = false;
                    }

                    if ((average < self.configuration.thresholdLow) && !lowEvent) {
                        lowEvent = true;
                        self.publishEvent('lowThresholdReached');
                    }

                    if (average > self.configuration.thresholdLow) {
                        lowEvent = false;
                    }

                });

            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };
    /**
     *
     */
    LightSensor.prototype.getState = function () {
        return this.state;
    };
}