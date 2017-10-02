module.exports = {
    metadata: {
        plugin: "multi",
        label: "Multi",
        role: "sensor",
        family: "multi",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [],
        state: [{
            id: "thermometerCelsius",
            label: "Thermometer Celsius",
            type: {
                id: "string"
            }
        }, {
            id: "thermometerFahrenheit",
            label: "Thermometer Fahrenheit",
            type: {
                id: "string"
            }
        }, {
            id: "thermometerKelvin",
            label: "Thermometer Kelvin",
            type: {
                id: "string"
            }
        }, {
            id: "barometerPressure",
            label: "Barometer Pressure",
            type: {
                id: "string"
            }
        }, {
            id: "hygrometerRelativeHumidity",
            label: "Hygrometer relative Humidity",
            type: {
                id: "string"
            }
        }],
        configuration: [{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "BME280",
                    id: "BME280"
                }]
            }
        }, {
            label: "Rate",
            id: "rate",
            type: {
                id: "integer"
            },
            defaultValue: 1000,
            unit: "ms"
        }]
    },
    create: function () {
        return new Multi();
    }
};

/**
 *
 */
function Multi() {
    /**
     *
     */
    Multi.prototype.start = function () {
        try {
            if (!this.isSimulated()) {
                var five = require("johnny-five");

                var multi = new five.Multi({
                    controller: this.configuration.controller,
                    freq: this.configuration.rate
                });


                this.state = {
                    thermometerCelsius: '',
                    thermometerFahrenheit: '',
                    thermometerKelvin: '',
                    barometerPressure: '',
                    hygrometerRelativeHumidity: ''
                }
                ;

                var self = this;

                multi.on("change", function () {

                    self.state.thermometerCelsius = this.thermometer.celsius;
                    self.state.thermometerFahrenheit = this.thermometer.fahrenheit;
                    self.state.thermometerKelvin = this.thermometer.kelvin;
                    self.state.barometerPressure = this.barometer.pressure;
                    self.state.hygrometerRelativeHumidity = this.hygrometer.relativeHumidity;

                    self.publishStateChange();


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
    Multi.prototype.getState = function () {
        return this.state;
    };
};