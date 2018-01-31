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
            id: "motion",
            label: "Motion",
            type: {
                id: "boolean"
            }
        }, {
            id: "ticks",
            label: "Ticks",
            type: {
                id: "integer"
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
            defaultValue: 5000,
            unit: "s"
        },]
    },
    create: function () {
        return new Motion();
    }
};

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
                    motion: false,
                    ticks: 0
                };

                let timer;
                let self = this;

                this.motion.on("motionstart", function () {

                    if (self.state.motion === false) {
                        self.state.motion = true;
                        self.state.ticks = 1;
                        self.publishStateChange();

                        self.publishEvent('motionDetected', {
                                motion: self.state.motion,
                                ticks: self.state.ticks
                            }
                        );

                    } else {
                        self.state.ticks = self.state.ticks + 1;
                        self.publishStateChange();

                        self.publishEvent('tic', {
                                motion: self.state.motion,
                                ticks: self.state.ticks
                            }
                        );
                    }

                    self.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");

                    clearTimeout(timer);

                    timer = setTimeout(function () {
                        self.state.motion = false;
                        self.state.ticks = 0;
                        self.publishStateChange();

                        self.publishEvent('noMoreMotion', {
                            motion: self.state.motion,
                            ticks: self.state.ticks
                        });
                        self.logDebug("Release Time Over");
                    }, self.configuration.releaseTime * 1000)
                });

            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    Motion.prototype.getState = function () {
        return this.state;
    };
};