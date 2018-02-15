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

                this.state = {
                    occupied: false,
                    ticksPerMinute: 0
                };

                this.lastTicks = [];


                this.motion.on("motionstart", () => {
                    this.lastTicks.unshift(Date.now());

                    this.state.lastMotionTimestamp = moment().toISOString();

                    if (this.state.occupied === false) {
                        this.state.occupied = true;
                        // this.publishStateChange();
                        this.publishEvent('motionDetected', {});

                        this.tickUpdateInterval = setInterval(function () {
                            getTicksOverTime(this);
                            this.publishStateChange();

                            console.log("inside interval state ", this.state);

                        }.bind(this), 5000);

                    } else {
                        getTicksOverTime(this);

                        console.log("inside tic state ", this.state);

                        this.publishStateChange();
                        this.publishEvent('tic', {});


                    }

                    //----------------------------------------
                    this.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");
                    clearTimeout(this.timer);

                    this.timer = setTimeout(function () {
                        this.state.occupied = false;
                        this.publishStateChange();

                        this.publishEvent('noMoreMotion', {});
                        this.logDebug("Release Time Over");
                    }.bind(this), this.configuration.releaseTime * 1000)
                });


                function getTicksOverTime(original) {

                    let timestamp = Date.now();
                    while ((timestamp - original.lastTicks[original.lastTicks.length - 1]) > (original.configuration.tickCountTime * 60000)) {
                        original.lastTicks.pop();
                    }
                    // console.log("tickCountTimeMinutes " + original.configuration.tickCountTime);


                    let currentTicks = original.lastTicks.length / original.configuration.tickCountTime;

                    if (original.state.lastTicksticksPerMinute !== currentTicks.toFixed(0)) {
                        // console.log(original);
                        original.state.ticksPerMinute = parseInt(currentTicks.toFixed(0));
                        original.logDebug("New tick calculation: " + original.state.ticksPerMinute);
                    }
                    if (original.lastTicks.length === 0) {
                        clearInterval(original.tickUpdateInterval);
                    }
                }


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
        clearInterval(this.tickUpdateInterval);
    };
};

