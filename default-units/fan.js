module.exports = {
    metadata: {
        plugin: "Fan",
        label: "Fan",
        role: "actor",
        family: "fan",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "on",
            label: "On"
        }, {
            id: "off",
            label: "Off"
        }, {
            id: "speed",
            label: "Speed"
        }],
        state: [{
            id: "speed",
            label: "Speed",
            type: {
                id: "integer"
            }, defaultValue: "125"
        }],
        configuration: [{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "DEFAULT",
                    id: "DEFAULT"
                }, {
                    label: "PCA9685",
                    id: "PCA9685"
                }]
            }
        }, {
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
            }
        },{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "DEFAULT",
                    id: "DEFAULT"
                }, {
                    label: "PCA9685",
                    id: "PCA9685"
                }]
            }
        },]
    },
    create: function () {
        return new Fan();
    }
};

var q = require('q');

/**
 *
 */
function Fan() {
    /**
     *
     */
    Fan.prototype.start = function () {
        var deferred = q.defer();


        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.fan = new five.Led({
                    controller: "PCA9685",
                    // controller: this.configuration.controller,
                    pin: 9
                });


                this.fan.brightness(0);

                this.logDebug("Fan initialized.");

                deferred.resolve();

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

        return deferred.promise;
    };

    /**
     *
     */
    Fan.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Fan.prototype.setState = function (state) {

        this.state = Math.min(state.speed, 255);

        if (this.fan) {
            this.fan.brightness(this.state.speed);
            this.publishStateChange();
        }
    };

    /**
     *
     */
    Fan.prototype.speed = function (speed) {

        try {
            if (this.fan) {
                this.state.speed = Math.min(speed, 255);
                this.fan.brightness(this.state.speed);
            }

            this.publishStateChange();
        }
        catch (err) {

        }
    };


    /**
     *
     */
    Fan.prototype.on = function () {

        try {
            if (this.fan) {
                this.fan.on();
                this.state.speed = 255;
                this.fan.brightness(this.state.speed);
            }

            this.publishStateChange();
        }
        catch (err) {

        }
    };

    /**
     *
     */
    Fan.prototype.off = function () {

        try {

            if (this.fan) {
                this.fan.off();
                this.state.speed = 0;
                this.fan.brightness(this.state.speed);
                this.fan.stop();
            }

            this.publishStateChange();
        }
        catch (err) {


        }
    };

};
