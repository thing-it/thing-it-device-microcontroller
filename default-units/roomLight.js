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

                this.upButton = new five.Button({
                    pin: 2, //TODO DEMOCASE
                    isPullup: true,
                });

                this.downButton = new five.Button({
                    pin: 17,//TODO DEMOCASE
                    type: "digital",
                    isPullup: true,
                });

                this.pressButton = new five.Button({
                    pin: 16,//TODO DEMOCASE
                    type: "digital",
                    isPullup: true,
                });


                this.setState(this.state);
                this.logDebug("Room Light initialized.");

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
    RoomLight.prototype.setState = function (targetstate) {

        if (this.isSimulated()) {
            this.state = targetstate;
            this.publishStateChange();

        } else {

            this.state = targetstate;
            let byteBrightness = (targetstate.brightness * 2.55).toFixed();

            if (byteBrightness > 255) {
                byteBrightness = 255
            }

            if (this.state.switch) {
                this.led1.brightness(byteBrightness);
                this.led1.on();

                this.led2.brightness(byteBrightness);
                this.led2.on();

                this.led3.brightness(byteBrightness);
                this.led3.on();

            } else {
                this.led1.brightness(byteBrightness);
                this.led1.stop().off();

                this.led2.brightness(byteBrightness);
                this.led2.stop().off();

                this.led3.brightness(byteBrightness);
                this.led3.stop().off();
            }
            this.publishStateChange();
        }
    };

    /**
     *
     */
    RoomLight.prototype.toggleLight = function () {

        try {
            if (this.state.switch === false) {
                this.state.switch = true;
                this.led1.on();
                this.led2.on();
                this.led3.on();

            } else {
                this.state.switch = false;
                this.led1.stop().off();
                this.led2.stop().off();
                this.led3.stop().off();
            }

            this.publishStateChange();
        }
        catch (err) {
            this.logDebug("########### Error in Microcontroller Actor. For safty reasons TIN is shutting down ###########");
            //process.exit();
        }
    };

};
