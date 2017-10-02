module.exports = {
    metadata: {
        plugin: "thermostat",
        label: "Microcontroller Thermostat",
        role: "actor",
        family: "thermostat",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [
            {id: "incrementSetpoint", label: "Increment Setpoint"},
            {id: "decrementSetpoint", label: "Decrement Setpoint"},
        ],
        state: [
            {
                id: "setpoint", label: "Setpoint",
                type: {
                    id: "decimal"
                }
            }, {
                id: "temperature", label: "Temperature",
                type: {
                    id: "decimal"
                }
            }, {
                id: "mode", label: "Mode",
                type: {
                    id: "string"
                }
            }, {
                id: "heatActive", label: "Heat Active",
                type: {
                    id: "boolean"
                }
            }, {
                id: "coolActive", label: "Cool Active",
                type: {
                    id: "boolean"
                }
            }],
        configuration: [
            {
                label: "Minimum Setpoint",
                id: "minimumSetpoint",
                type: {
                    id: "integer"
                },
                defaultValue: 18
            }, {
                label: "Maximum Setpoint",
                id: "maximumSetpoint",
                type: {
                    id: "integer"
                },
                defaultValue: 26
            }, {
                label: "Tolerance",
                id: "tolerance",
                type: {
                    id: "integer"
                },
                defaultValue: 1
            }, {
                label: "Step Size",
                id: "stepSize",
                type: {
                    id: "integer"
                },
                defaultValue: 1
            }
            // TODO Julian - add configuration for temp sensor, display, increase button, decrease button, mode LEDs
        ]
    },
    create: function () {
        return new Thermostat();
    }
};

var q = require('q');

/**
 *
 */
function Thermostat() {
    /**
     *
     */
    Thermostat.prototype.start = function () {
        var tempRangeMidpoint = (this.configuration.minimumSetpoint + this.configuration.maximumSetpoint) / 2;

        this.state = {
            setpoint: tempRangeMidpoint
        };

        //this.logLevel = 'debug';

        if (this.isSimulated()) {
            this.logDebug("Starting in simulated mode");

            this.simulationInterval = setInterval(function () {
                this.update()
            }.bind(this), 10000);
        } else {
            this.logDebug("Starting in non-simulated mode");


            var five = require("johnny-five");


            this.buttonIncrease = new five.Button({
                pin: 6,
                isPullup: true
            });

            this.buttonDecrease = new five.Button({
                pin: 7,
                isPullup: true
            });

            this.multi = new five.Multi({
                controller: "BME280",
                freq: 1000
            });

            this.lcd = new five.LCD({
                pins: [8, 9, 10, 11, 12, 13],
                rows: 4,
                cols: 16
            });

            this.led1 = new five.Led.RGB({
                controller: "PCA9685",

                pins: {
                    red: 2,
                    green: 1,
                    blue: 0
                }
            });

            this.led2 = new five.Led.RGB({
                controller: "PCA9685",

                pins: {
                    red: 3,
                    green: 4,
                    blue: 5
                }
            });

            this.led3 = new five.Led.RGB({
                controller: "PCA9685",
                isAnode: false,
                pins: {
                    red: 6,
                    green: 7,
                    blue: 8
                }
            });


            //LCD Preperation
            this.lcd.clear();
            this.lcd.cursor(0, 0);
            this.lcd.print("Temperature: ");
            this.lcd.cursor(0, 16);
            this.lcd.print("Setp");
            this.lcd.cursor(2, 0);
            this.lcd.print("oint: ");
            this.lcd.cursor(3, 0);
            this.lcd.print(" C");


            // Register Listeners
            this.buttonIncrease.on("up", function () {
                this.incrementSetpoint();
            }.bind(this));

            this.buttonDecrease.on("up", function () {
                this.decrementSetpoint();
            }.bind(this));

            var self = this;

            this.multi.on("data", function () {
                self.state.liveTemperature = this.thermometer.celsius;
            });

        }

        this.productionInterval = setInterval(function () {
            this.update()
        }.bind(this), 1000);


        return q();
    };

    /**
     *
     */
    Thermostat.prototype.stop = function () {
        var promise;

        if (this.isSimulated()) {
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }

            promise = q();
        } else {
            if (this.productionInterval) {
                clearInterval(this.simulationInterval);
            }
            promise = q();
        }

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Thermostat.prototype.setState = function (targetstate) {
        var promise = q();
        this.logDebug('Received set state.', targetstate);

        if (targetstate) {
            if (targetstate.temperature) {
                this.state.temperature = targetstate.temperature;
            }

            if (targetstate.setpoint) {
                this.state.setpoint = targetstate.setpoint;
            }

            promise = this.determineMode()
                .then(function () {
                    this.publishStateChange();
                    this.logDebug('State set.');
                }.bind(this));

        } else {
            promise = q.fcall(function () {
                throw new Error('Provided state was empty.')
            })
        }

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.update = function () {
        this.logDebug('Updating values.');

        var promise = this.getTemperatureFromSensor()
            .then(function () {
                this.logDebug('Got temperature.');
                return this.determineMode();
            }.bind(this))
            .then(function () {
                this.publishStateChange();
                this.logDebug('Values updated.');
            }.bind(this))
            .catch(function (error) {
                this.logError(error);
                return q();
            }.bind(this));

        return promise;
    };


    /**
     *
     */
    Thermostat.prototype.modifySetpoint = function (targetModification) {
        var promise;
        this.logDebug('Modifying setpoint.', targetModification);

        this.state.setpoint += targetModification;

        promise = this.determineMode()
            .then(function () {
                this.publishStateChange();
                this.logDebug('Setpoint modified.');
            }.bind(this));

        return promise;
    };

    /**
     * TODO Julian - connect the button for increasing the setpoint to this method. DONE
     */
    Thermostat.prototype.incrementSetpoint = function () {
        var promise;

        if ((this.state.setpoint + this.configuration.stepSize) <= this.configuration.maximumSetpoint) {
            promise = this.modifySetpoint(this.configuration.stepSize);
        } else {
            this.logDebug('Ignoring attempt to increase setpoint over limit.');
            promise = q();
        }

        return promise;
    };

    /**
     * TODO Julian - connect the button for decreasing the setpoint to this method. DONE
     */
    Thermostat.prototype.decrementSetpoint = function () {
        var promise;

        if ((this.state.setpoint - this.configuration.stepSize) >= this.configuration.minimumSetpoint) {
            promise = this.modifySetpoint(this.configuration.stepSize * -1);
        } else {
            this.logDebug('Ignoring attempt to decrease setpoint below limit.');
            promise = q();
        }

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.getTemperatureFromSensor = function () {
        var deferred = q.defer();
        var promise;

        if (this.isSimulated()) {
            switch (this.state.mode) {
                case 'HEAT':
                    this.state.temperature += Math.random();
                    break;
                case 'COOL':
                    this.state.temperature -= Math.random();
                    break;
                case 'NEUTRAL':
                    //do nothing;
                    break;
                default:
                    this.state.temperature = 20;
            }

            promise = q(this.state.temperature);

        } else {

            promise = deferred.promise;

            this.state.temperature = this.state.liveTemperature; // TODO Julian - implement actual sensor update call instead and make sure to resolve or reject deferred DONE

            promise = q(this.state.temperature);

        }

        this.logDebug('Temperature retrieved.', this.state.temperature);
        return promise;
    };


    /**
     *
     */
    Thermostat.prototype.determineMode = function () {
        this.logDebug('Determining mode.', this.state.setpoint, this.state.temperature);
        var promise;
        var delta = this.state.setpoint - this.state.temperature;

        if (Math.abs(delta) > this.configuration.tolerance) {
            if (delta > 0) {
                this.state.heatActive = true;
                this.state.coolActive = false;
                promise = this.setMode('HEAT');
            } else {
                this.state.heatActive = false;
                this.state.coolActive = true;
                promise = this.setMode('COOL');
            }
        } else {
            this.state.heatActive = false;
            this.state.coolActive = false;
            promise = this.setMode('NEUTRAL');
        }

        return promise.then(function () {
            return this.updateDisplay();
        }.bind(this));
    };

    /**
     *
     * @param mode
     */
    Thermostat.prototype.setMode = function (mode) {
        var color;

        this.state.mode = mode;

        switch (mode) {
            // TODO Julian - replace the color names with what you actually want to send to the LED.
            case 'HEAT':
                color = 'red';
                break;
            case 'COOL':
                color = 'blue';
                break;
            case 'NEUTRAL':
                color = 'white';
                break;
            default:
                this.logError('Got unexpected mode: "' + mode + '". Valid modes are HEAT, COOL, and NEUTRAL.');
        }

        return this.updateLEDs(color);
    };

    /**
     *
     * @param color
     */
    Thermostat.prototype.updateLEDs = function (color) {
        this.logDebug('Setting LED color:', color);
        var promise;
        var deferred = q.defer();

        if (this.isSimulated()) {
            promise = q();
        } else {
            // TODO Julian - implement actual LED update call, make sure to resolve or reject 'deferred'.

            this.led1.color(color);
            this.led2.color(color);
            this.led3.color(color);

            deferred.resolve();

            promise = deferred.promise;
        }

        return promise;
    };


    /**
     *
     */
    Thermostat.prototype.updateDisplay = function () {
        this.logDebug('Setting display.', this.state.temperature, this.state.setpoint);
        var promise;
        var deferred = q.defer();

        if (this.isSimulated()) {
            promise = q();
        } else {

            this.lcd.cursor(1, 0);
            this.lcd.print(this.state.temperature.toFixed(1) + " C");

            this.lcd.cursor(1, 16);
            this.lcd.print(this.state.setpoint.toFixed(1));

            //deferred.resolve();
            // TODO Julian - implement actual Display update call, make sure to resolve or reject 'deferred'.
            promise = deferred.promise;
        }

        return promise;
    };
}
