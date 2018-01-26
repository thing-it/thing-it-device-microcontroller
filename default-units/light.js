module.exports = {
    metadata: {
        plugin: "lightSensor",
        label: "Light Sensor",
        role: "sensor",
        family: "light",
        deviceTypes: ["microcontroller/microcontroller"],
        unit: "LUX",
        state: [{
            id: "luminance",
            label: "Luminance",
            type: {
                id: "number"
            }
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
            label: "Threshold",
            id: "threshold",
            type: {
                id: "number"
            },
            unit: "LUX",
            defaultValue: 10,
        }, {
            label: "Average Time",
            id: "averageTime",
            type: {
                id: "number"
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

                this.logLevel = 'debug';

                var five = require("johnny-five");

                this.state = {
                    luminance: 0
                };

                this.lightSensor = new five.Light({
                    controller: this.configuration.controller,
                    freq: 500,
                });

                var value = [];
                var self = this;

                this.lightSensor.on("data", function (data) {

                    value.push(data.lux);

                    if (value.length > self.configuration.averageTime * 2) {
                        value.shift();
                        let sum = value.reduce(function (a, b) {
                            return (a + b)
                        });

                        let average = (sum / value.length).toFixed(2);

                        if ((Math.abs(average - self.state.luminance)) >= self.configuration.threshold) {
                            self.state.luminance = average;
                            self.logDebug("\x1b[36mLuminance: \x1b[0m" + self.state.luminance);
                            self.publishStateChange();
                        }
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