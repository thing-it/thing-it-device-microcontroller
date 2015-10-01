module.exports = {
    metadata: {
        plugin: "potentiometer",
        label: "Potentiometer",
        role: "sensor",
        family: "rangeSensor",
        deviceTypes: ["microcontroller/microcontroller"],
        unit: "Degrees",
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
            label: "Minimum",
            id: "min",
            type: {
                id: "integer"
            },
            defaultValue: 0
        }, {
            label: "Maximum",
            id: "max",
            type: {
                id: "integer"
            },
            defaultValue: 1023
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

                this.potentiometer = new five.Sensor({
                    pin: this.configuration.pin,
                    freq: this.configuration.rate
                });

                var self = this;

                this.potentiometer.on("change", function (event) {
                    self.value = self.potentiometer.value;

                    self.change(event);
                });
                this.potentiometer.on("data", function () {
                    self.value = self.potentiometer.value;

                    self.data(self.potentiometer.value);
                });
            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
            + this.id + ":" + x);
        }
    };
};