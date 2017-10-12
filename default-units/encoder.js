module.exports = {
    metadata: {
        plugin: "encoder",
        label: "Rotary Encoder",
        role: "sensor",
        family: "encoder",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [
            {
                id: "increase",
                label: "Increase"
            }, {
                id: "decrease",
                label: "Decrease"
            }, {
                id: "pressed",
                label: "Pressed"
            }
        ],
        state: [{
            id: "value",
            label: "Value",
            type: {
                id: "integer"
            }, defaultValue: "125"
        }, {
            id: "switch",
            label: "Switch",
            type: {
                id: "boolean"
            }, defaultValue: false
        }],
        configuration: [
            {
                label: "Step size",
                id: "stepSize",
                typ: {
                    id: "integer"
                },
                defaultValue: 1,
            }]
    },
    create: function () {
        return new Encoder();
    }
};

var q = require('q');

/**
 *
 */
function Encoder() {
    /**
     *
     */
    Encoder.prototype.start = function () {

        var deferred = q.defer();


        this.state = {
            value: 0
        };

        if (!this.configuration.stepSize) {
            this.configuration.stepSize = 5;
        }

        if (!this.isSimulated()) {
            try {

                var five = require("johnny-five");


                var upButton = new five.Button({
                    pin: 2, //TODO Make this configurable.
                    isPullup: true,
                });

                var downButton = new five.Button({
                    pin: 17,//TODO Make this configurable.
                    type: "digital",
                    isPullup: true,
                });

                var pressButton = new five.Button({
                    pin: 16,//TODO Make this configurable.
                    type: "digital",
                    isPullup: true,
                });


                var waveform = '';
                var waveformTimeout;

                upButton.on('up', function () {
                    waveform += '1';
                    handleWaveform();
                });

                downButton.on('up', function () {
                    waveform += '0';
                    handleWaveform();
                });

                pressButton.on('down', function () {
                    this.state.switch = !this.state.switch;

                    this.logDebug("Switch State: " + this.state.switch);

                    this.publishStateChange();

                }.bind(this));

                var self = this;


                function handleWaveform() {
                    if (waveform.length < 2) {
                        waveformTimeout = setTimeout(function () {
                            waveform = '';
                        }, 8);
                        return;
                    }

                    if (waveformTimeout) {
                        clearTimeout(waveformTimeout);
                    }

                    if (waveform === '01') {

                        self.state.value = Math.min(self.state.value + self.configuration.stepSize, 255);

                        self.publishEvent("increase");
                        self.publishStateChange();

                    } else if (waveform === '10') {
                        self.state.value = self.state.value - self.configuration.stepSize;

                        if (self.state.value < 0) {
                            self.state.value = 0;
                        }

                        self.publishEvent("decrease");
                        self.publishStateChange();
                    }

                    waveform = '';
                }

                deferred.resolve();

            } catch (error) {
                this.device.node
                    .publishMessage("Cannot initialize " +
                        this.device.id + "/" + this.id +
                        ":" + error);

                deferred.reject(error);
            }
        }
        else {
            deferred.resolve();
        }

        return deferred.promise;


    };


    Encoder.prototype.getState = function () {
        return this.state;
    };
}
