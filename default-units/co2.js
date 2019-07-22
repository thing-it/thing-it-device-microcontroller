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
        return new Co2();
    }
};

/**
 *
 */
function Co2() {
    /**
     *
     */
    Co2.prototype.start = function () {
        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        try {
            if (!this.isSimulated()) {
                var five = require("johnny-five");

                this.state = {
                    value: 0
                };

                this.co2 = new five.Sensor({
                    pin: this.configuration.pin,
                    freq: this.configuration.rate,
                    threshold: this.configuration.threshold
                });

                //TODO We need some calculation for ppm values here Example: https://www.dfrobot.com/wiki/index.php/CO2_Sensor_SKU:SEN0159

                var self = this;

                this.co2.on("change", function () {

                    self.state.value = this.value;


                    self.logDebug("Value: " + this.value);

                });

                this.co2.on("data", function () {

                    self.state.value = this.value;



                    self.logDebug("Value: " + this.value);

                });

                this.operationalState = {
                    status: 'OK',
                    message: 'Co2 sensor successfully initialized'
                }
                this.publishOperationalStateChange();
            } else {
                this.operationalState = {
                    status: 'OK',
                    message: 'Co2 sensor successfully initialized'
                }
                this.publishOperationalStateChange();
            }

        } catch (x) {
            this.operationalState = {
                status: 'ERROR',
                message: "Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x
            }
            this.publishOperationalStateChange();  
            
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };



    Co2.prototype.getState = function () {
        return this.state;
    };
};