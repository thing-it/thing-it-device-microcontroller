module.exports = {
    metadata: {
        plugin: "co2",
        label: "co 2",
        role: "sensor",
        family: "co2",
        deviceTypes: ["microcontroller/microcontroller"],
        state: [{
            id: "value",
            label: "Value",
            type: {
                id: "integer"
            }
        }],
        configuration: [{
            label: "Pin",
            id: "pin",
            type: {
                family: "reference",
                id: "analogInPin"
            },
            defaultValue: "A0"
        }, {
            label: "Rate",
            id: "rate",
            type: {
                id: "integer"
            },
            defaultValue: 1000,
            unit: "ms"
        }, {
            label: "Threshold",
            id: "threshold",
            type: {
                id: "integer"
            },
            defaultValue: 1
        }]
    },
    create: function () {
        return new Potentiometer();
    }
};

/**
 *
 */
function Potentiometer() {
    /**
     *
     */
    Potentiometer.prototype.start = function () {
        try {
            if (!this.isSimulated()) {
                var five = require("johnny-five");

                this.co2 = new five.Sensor({
                    pin: this.configuration.pin,
                    freq: this.configuration.rate,
                    threshold: this.configuration.threshold
                });

                //TODO We need some calculation for ppm values here Example: https://www.dfrobot.com/wiki/index.php/CO2_Sensor_SKU:SEN0159

                var self = this;

                this.co2.on("change", function () {

                    self.state.value = this.value;

                    self.publishValueChangeEvent({
                        value: this.value
                    });

                    self.logDebug("Value: " + this.value);

                });

                this.co2.on("data", function () {

                    self.state.value = this.value;

                    self.publishValueChangeEvent({
                        value: this.value
                    });

                    self.logDebug("Value: " + this.value);

                });


            }

        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };
};