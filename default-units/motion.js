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
            defaultValue: 4,
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

        try {
            if (!this.isSimulated()) {

                let five = require("johnny-five");

                this.motion = new five.Motion({
                    controller: "HCSR501", //TODO Make Configurable
                    pin: this.configuration.pin
                });
                //
                // this.state = {
                //     motion: false,
                //     ticksPerMinute: 0
                // };

                this.state = {
                    occupied: false,
                    ticksPerMinute: 0
                };


                let self = this;
                let lastTicks = [];

                this.motion.on("motionstart", function () {
                    lastTicks.unshift(Date.now());
                    this.state.lastMotionTimestamp = moment().toISOString();


                    if (this.state.occupied === false) {

                        this.state.occupied = true;
                        this.publishStateChange();

                        this.publishEvent('motionDetected', {
                            occupied: this.state.occupied,
                            ticksPerMinute: this.state.ticksPerMinute
                        });

                    } else {
                        self.publishEvent('tic', {
                                occupied: this.state.occupied,
                                ticksPerMinute: this.state.ticksPerMinute
                            }
                        );

                    }

                    this.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");

                    clearTimeout(this.timer);

                    this.timer = setTimeout(function () {
                        this.state.occupied = false;
                        this.publishStateChange();
                        this.publishEvent('noMoreMotion', {
                            occupied: this.state.motion,
                            ticksPerMinute: this.state.ticksPerMinute
                        });
                        this.logDebug("Release Time Over");
                    }.bind(this), this.configuration.releaseTime * 1000)
                }.bind(this));


                this.tickInterval = setInterval(function () {
                    let timestamp = Date.now();
                    while ((timestamp - lastTicks[lastTicks.length - 1]) > (this.configuration.tickCountTime * 60000)) {
                        lastTicks.pop();
                    }
                    this.state.ticksPerMinute = (lastTicks.length / this.configuration.tickCountTime).toFixed();
                    this.publishStateChange();
                }.bind(this), 5000);


            }
        } catch
            (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    Motion.prototype.getState = function () {
        return this.state;
    };

    Motion.prototype.stop = function () {
        clearTimeout(this.timer);
        clearInterval(this.tickInterval);
    };
};