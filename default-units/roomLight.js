module.exports = {
    metadata: {
        plugin: "roomLight",
        label: "Room Light",
        role: "actor",
        family: "roomLight",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [
            {id: "toggleLight", label: "Toggle Light"},
            {id: "changeDimmer", label: "Change Dimmer"},
        ],
        state: [
            {
                id: "switch", label: "Switch",
                type: {
                    id: "boolean"
                }
            }, {
                id: "brightness", label: "Brightness",
                type: {
                    id: "decimal"
                }
            }],
        configuration: [{
            label: "Encoder sensitivity",
            id: "encoderSensitivity",
            typ: {
                id: "integer"
            },
            defaultValue: 1,
        }]
    },
    create: function () {
        return new RoomLight();
    }
};

var q = require('q');

/**
 *
 */
function RoomLight() {
    /**
     *
     */
    RoomLight.prototype.start = function () {
        var deferred = q.defer();

        // this.state = {
        //     light: "off",
        //     brightness: 0
        // };

        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.light1 = new five.Led({
                    pin: 12,
                    controller: this.configuration.controller,
                    isAnode: true
                });

                this.light2 = new five.Led({
                    pin: 13,
                    controller: this.configuration.controller,
                    isAnode: true
                });

                this.light3 = new five.Led({
                    pin: 14,
                    controller: this.configuration.controller,
                    isAnode: true
                });





                this.setState(this.state);
                this.logDebug("LED initialized.");

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
    RoomLight.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    RoomLight.prototype.setState = function (state) {
        this.state.light = state.light;

        // if (this.led) {
        //     if (this.state.light === "blink") {
        //         this.led.blink();
        //         this.led.brightness(this.state.brightness);
        //     } else if (this.state.light === "on") {
        //         this.led.stop();
        //         this.led.on();
        //         this.led.brightness(this.state.brightness);
        //
        //     } else {
        //         this.led.stop().off();
        //     }
        // }
    };

    /**
     *
     */
    RoomLight.prototype.on = function () {

        try {
            if (this.led) {
                this.led.stop();
                this.led.on();
            }

            this.state.light = "on";

            this.publishStateChange();
        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. For safty reasons TIN is shutting down ###########");
            //process.exit();
        }
    };

    /**
     *
     */
    RoomLight.prototype.off = function () {

        try {

            if (this.led) {
                this.led.stop().off();
            }

            this.state.light = "off";

            this.publishStateChange();
        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. For safty reasons TIN is shutting down ###########");
            //process.exit();
        }
    };

    /**
     *
     */
    RoomLight.prototype.toggle = function () {

        try {
            if (this.state.light == "off") {
                this.state.light = "on";

                if (this.led) {
                    this.led.stop();
                    this.led.on();
                }
            } else {
                this.state.light = "off";

                if (this.led) {
                    this.led.stop().off();
                }
            }

            this.publishStateChange();

        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. For safty reasons TIN is shutting down ###########");
            //process.exit();
        }
    };

    /**
     *
     */

    /**
     *
     */
    Led.prototype.brightness = function (parameters) {

        try {
            if (this.led) {
                this.state.brightness = parameters.brightness;
                this.led.brightness(parameters.brightness);
            }

            this.state.light = "on";

            this.publishStateChange();

        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. For safty reasons TIN is shutting down ###########");
            //process.exit();
        }


    }
}
;
