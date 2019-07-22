module.exports = {
    metadata: {
        plugin: "motion",
        label: "Motion",
        role: "sensor",
        family: "motion",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [{
            id: "motionDetected",
            label: "Motion detected"
        }, {
            id: "tic",
            label: "Motion Tic"
        }, {
            id: "noMoreMotion",
            label: "No more Motion"
        }],
        state: [{
            label: "Occupied",
            id: "occupied",
            type: {
                id: "boolean"
            }
        }, {
            label: "Ticks/Minute",
            id: "ticksPerMinute",
            type: {
                id: "integer"
            }
        }, {
            label: "Last Motion Timestamp",
            id: "lastMotionTimestamp",
            type: {
                id: "string"
            }
        }],
        configuration: [{
            label: "Pin",
            id: "pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "12"
        }, {
            label: "Release Time",
            id: "releaseTime",
            type: {
                id: "integer"
            },
            defaultValue: 240,
            unit: "s"
        }, {
            label: "Tick count Time",
            id: "tickCountTime",
            type: {
                id: "integer"
            },
            defaultValue: 1,
            unit: "m"
        }]
    },
    create: function () {
        return new Motion();
    }
};


var moment = require('moment');

/**
 *
 */
function Motion() {
    /**
     *
     */
    Motion.prototype.start = function () {
        this.logLevel = 'debug';

        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        try {
            if (!this.isSimulated()) {

                let five = require("johnny-five");

                this.motion = new five.Motion({
                    controller: "HCSR501", //TODO Make Configurable
                    pin: this.configuration.pin
                });

                this.state = {
                    occupied: false,
                    ticksPerMinute: 0,
                    lastMotionTimestamp: ''
                };

                this.lastTicks = [];

                //####### automated update version

                this.tickUpdateInterval = setInterval(function () {
                    udateTicksOverTime(this.lastTicks, this.configuration.tickCountTime, function (newTickArrayLength) {
                        this.state.ticksPerMinute = parseFloat(newTickArrayLength.toFixed(2));
                        // if (this.state.ticksPerMinute === 0) {
                        //     this.state.ticksPerMinute += 0.01;
                        // }
                        this.publishStateChange();
                        this.logDebug("New Tick Value: " + this.state.ticksPerMinute + " p.M. within a average over " + this.configuration.tickCountTime + " Minutes");
                    }.bind(this));
                }.bind(this), 60000);


                this.motion.on("motionstart", () => {
                    this.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");
                    this.lastTicks.unshift(Date.now());
                    this.state.lastMotionTimestamp = moment().toISOString();

                    udateTicksOverTime(this.lastTicks, this.configuration.tickCountTime, function (newTickArrayLength) {
                        this.state.ticksPerMinute = parseFloat(newTickArrayLength.toFixed(2));
                        this.publishStateChange();
                        this.logDebug("New Tick Value: " + this.state.ticksPerMinute + " p.M. within a average over " + this.configuration.tickCountTime + " Minutes");
                    }.bind(this));

                    if (this.state.occupied === false) {
                        this.state.occupied = true;
                        this.publishStateChange();
                        this.publishEvent('motionDetected', {});
                    } else {
                        this.publishEvent('tic', {});
                    }


                    clearTimeout(this.timer);

                    this.timer = setTimeout(function () {
                        this.state.occupied = false;
                        this.publishStateChange();
                        this.publishEvent('noMoreMotion', {});
                        this.logDebug("Release Time Over");
                    }.bind(this), this.configuration.releaseTime * 1000)
                });


                function udateTicksOverTime(tickArray, tickCountTimeMinutes, callback) {
                    let timestamp = Date.now();
                    while ((timestamp - tickArray[tickArray.length - 1]) > (tickCountTimeMinutes * 60000)) {
                        tickArray.pop();
                    }
                    callback(tickArray.length / tickCountTimeMinutes);
                }

                //################################################


                // this.motion.on("motionstart", () => {
                //     this.lastTicks.unshift(Date.now());
                //     this.state.lastMotionTimestamp = moment().toISOString();
                //
                //     if (!this.tickUpdateIntervalStatus) {
                //         this.tickUpdateIntervalStatus = true;
                //         this.tickUpdateInterval = setInterval(function () {
                //             udateTicksOverTime(this.lastTicks, this.configuration.tickCountTime, function (newTickArrayLength) {
                //                 if (this.state.ticksPerMinute !== parseInt(newTickArrayLength.toFixed(2))) {
                //                     this.state.ticksPerMinute = parseInt(newTickArrayLength.toFixed(2));
                //                     this.publishStateChange();
                //                     this.logDebug("New Tick Value: " + this.state.ticksPerMinute + " p.M. within a average over " + this.configuration.tickCountTime + " Minutes");
                //                 }
                //                 if (newTickArrayLength === 0) {
                //                     clearInterval(this.tickUpdateInterval);
                //                     this.tickUpdateIntervalStatus = false;
                //                 }
                //             }.bind(this));
                //         }.bind(this), 1000);
                //     }
                //
                //     if (this.state.occupied === false) {
                //         this.state.occupied = true;
                //         this.publishStateChange();
                //         this.publishEvent('motionDetected', {});
                //     } else {
                //         this.publishEvent('tic', {});
                //     }
                //
                //     this.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");
                //
                //     clearTimeout(this.timer);
                //
                //     this.timer = setTimeout(function () {
                //         this.state.occupied = false;
                //         this.publishStateChange();
                //         this.publishEvent('noMoreMotion', {});
                //         this.logDebug("Release Time Over");
                //     }.bind(this), this.configuration.releaseTime * 1000)
                // });
                //
                //
                // function udateTicksOverTime(tickArray, tickCountTimeMinutes, callback) {
                //     let timestamp = Date.now();
                //     while ((timestamp - tickArray[tickArray.length - 1]) > (tickCountTimeMinutes * 60000)) {
                //         tickArray.pop();
                //     }
                //     callback(tickArray.length / tickCountTimeMinutes);
                // }


            }

            this.operationalState = {
                status: 'OK',
                message: 'Motion successfully initialized'
            }
            this.publishOperationalStateChange();
        } catch (x) {
            this.operationalState = {
                status: 'ERROR',
                message: "Cannot initialize " +
                this.device.id + "/" + this.id +
                ":" + error
            }
            this.publishOperationalStateChange(); 
            
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    Motion.prototype.getState = function () {
        return this.state;
    };

    Motion.prototype.stop = function () {
        clearTimeout(this.timer);
        clearInterval(this.tickUpdateInterval);
    };
};

