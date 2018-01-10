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
                var five = require("johnny-five");

                this.state = {
                    detected: false
                };

                var timer;

                this.motion = new five.Motion({
                    controller: "HCSR501", //TODO Make Configurable
                    pin: this.configuration.pin
                });

                var self = this;


                this.motion.on("motionstart", function () {
                    self.state.motion = true;
                    self.publishStateChange();
                    self.publishEvent('motionDetected');

                    self.logDebug("\x1b[36mMotion detected\x1b[0m and Timer reset");

                    clearTimeout(timer);

                    timer = setTimeout(function () {
                        self.state.motion = false;
                        self.publishStateChange();
                        self.publishEvent('noMoreMotion');

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