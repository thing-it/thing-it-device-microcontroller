module.exports = {
    metadata: {
        plugin: "lightSensor",
        label: "Light Sensor",
        role: "sensor",
        family: "light",
        deviceTypes: ["microcontroller/microcontroller"],
        unit: "LUX",
        configuration: [
            {
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
                var five = require("johnny-five");

                this.lightSensor = new five.Light({
                    freq: this.configuration.rate,
                    controller: this.configuration.controller,
                });

                var self = this;

                this.lightSensor.on("change", function (event) {


                });

                this.lightSensor.on("data", function (data) {


                });
            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };
};