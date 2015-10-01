module.exports = {
    metadata: {
        plugin: "photocell",
        label: "Photocell",
        role: "sensor",
        family: "rangeSensor",
        deviceTypes: ["microcontroller/microcontroller"],
        unit: "LUX",
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
        return new Photocell();
    }
};

/**
 *
 */
function Photocell() {
    /**
     *
     */
    Photocell.prototype.start = function () {
        try {
            if (!this.isSimulated()) {
                var five = require("johnny-five");

                this.photocell = new five.Sensor({
                    pin: this.configuration.pin,
                    freq: this.configuration.rate
                });

                var self = this;

                this.photocell.on("change", function (event) {
                    self.value = self.photocell.value;

                    self.change(event);
                });
                this.photocell.on("data", function () {
                    self.value = self.photocell.value;

                    self.data(self.photocell.value);
                });
            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };
};