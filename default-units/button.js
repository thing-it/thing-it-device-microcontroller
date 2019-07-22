module.exports = {
    metadata: {
        plugin: "button",
        label: "Button",
        role: "sensor",
        family: "button",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [
            {
                id: "hold",
                label: "Hold"
            }, {
                id: "press",
                label: "Press"
            }, {
                id: "release",
                label: "Release"
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
        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

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

                this.operationalState = {
                    status: 'OK',
                    message: 'Button successfully initialized'
                }
                this.publishOperationalStateChange();
            } catch (error) {
                this.operationalState = {
                    status: 'ERROR',
                    message: "Cannot initialize " +
                    this.device.id + "/" + this.id +
                    ":" + error
                }
                this.publishOperationalStateChange();   

                this.device.node
                    .publishMessage("Cannot initialize " +
                        this.device.id + "/" + this.id +
                        ":" + error);

                deferred.reject(error);
            }
        } else {
            this.operationalState = {
                status: 'OK',
                message: 'Button successfully initialized'
            }
            this.publishOperationalStateChange();

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
