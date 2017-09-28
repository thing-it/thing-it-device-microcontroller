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
            }, {
                id: "released",
                label: "Released"
            }
        ],
        state: [],
        configuration: [{
            label: "Pin",
            id: "pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "12"
        }, {
            label: "Inverted",
            id: "inverted",
            type: {
                id: "boolean"
            },
            defaultValue: false
        }, {
            label: "Pullup",
            id: "pullup",
            type: {
                id: "boolean"
            },
            defaultValue: false
        }, {
            label: "Pulldown",
            id: "pulldown",
            type: {
                id: "boolean"
            },
            defaultValue: false
        }, {
            label: "Holdtime",
            id: "holdtime",
            type: {
                id: "integer"
            },
            defaultValue: "500"
        }]
    },
    create: function () {
        return new Button();
    }
};

var q = require('q');

/**
 *
 */
function Button() {
    /**
     *
     */
    Button.prototype.start = function () {

        var deferred = q.defer();

        this.state = {};

        if (!this.isSimulated()) {
            try {

                var five = require("johnny-five");

                this.button = new five.Button({
                    pin: this.configuration.pin,
                    isPullup: this.configuration.pullup,
                    isPulldown: this.configuration.pulldown, //TODO Invert
                    invert: this.configuration.inverted,
                    holdtime: this.configuration.holdtime
                });

            } catch (error) {
                this.device.node
                    .publishMessage("Cannot initialize " +
                        this.device.id + "/" + this.id +
                        ":" + error);

                deferred.reject(error);
            }
        } else {
            deferred.resolve();
        }


        var self = this;

        //TODO Maybe here is some kind of debouncing needed

        this.button.on("hold", function () {
            self.publishEvent('hold');

        });

        this.button.on("press", function () {
            self.publishEvent('press',"0");
        });

        this.button.on("release", function () {
            self.publishEvent('release');

        });

        return deferred.promise;


    };


    Button.prototype.getState = function () {
        return this.state;
    };
}
