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
        }],
        state: [{
            id: "speed",
            label: "Speed",
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
        }]
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

        this.state = {
            speed: 0
        };

        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.fan = new five.Led({
                    controller: this.configuration.controller,
                    pin: this.configuration.pin,
                });


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
        this.state.speed = state.speed;

        if (this.fan) {
            this.fan = this.state.speed;
        }
    };

    /**
     *
     */
    Fan.prototype.on = function () {

        try {
            if (this.fan) {
                this.fan.stop();
                this.fan = this.state.speed;
            }

            this.publishStateChange();
        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. ###########");
        }
    };

    /**
     *
     */
    Fan.prototype.off = function () {

        try {

            if (this.fan) {
                this.fan.stop().off();
            }

            this.publishStateChange();
        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. ###########");

        }
    };

};
