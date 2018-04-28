module.exports = {
    metadata: {
        plugin: "jalousie",
        label: "Jalousie Control",
        role: "actor",
        family: "jalousie",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [
            {id: "setState", label: "Set State"},
            {id: "up", label: "Up"},
            {id: "down", label: "Down"},
            {id: "stopMotion", label: "Stop Motion"}
        ],
        state: [
            {
                id: "position", label: "position",
                type: {
                    id: "decimal"
                }
            }, {
                id: "rotation", label: "rotation",
                type: {
                    id: "decimal"
                }
            }],
        configuration: [
            {
                label: "LED intensitiy",
                id: "ledIntensity",
                type: {
                    id: "integer"
                },
                defaultValue: 255
            }, {
                label: "Speed",
                id: "speed",
                type: {
                    id: "integer"
                },
                defaultValue: 500
            }, {
                label: "Daylight color code",
                id: "dayLightColorCode",
                type: {
                    id: "string"
                },
                defaultValue: "#ffe800"
            }]
    },
    create: function () {
        return new Jalousie();
    }
};

var q = require('q');

/**
 *
 */
function Jalousie() {
    /**
     *
     */
    Jalousie.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            position: 100,
            rotation: 90
        };

        this.logLevel = 'debug';

        if (!this.isSimulated()) {

            try {
                var pixel = require("node-pixel");

                this.strip = new pixel.Strip({
                    board: this.device.board,
                    controller: "FIRMATA",
                    strips: [{
                        pin: 5, //TODO DEMOCASE
                        length: (24) //TODO DEMOCASE
                    },],
                    gamma: 2.8, // set to a gamma that works nicely for WS2812
                });

                this.strip.on("ready", function () {
                    this.strip.color("#000000");
                    this.showPixel();


                    this.logDebug("Jalousie initialized.");
                    this.logDebug(this.state);
                    this.publishStateChange();

                }.bind(this));


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
    Jalousie.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Jalousie.prototype.setState = function (state) {
        if (this.state.position < state.position) {
            this.down(state);
        }

        if (this.state.position > state.position) {
            this.up(state);
        }

    };

    /**
     *
     */
    Jalousie.prototype.showPixel = function (parameters) {

        if (!this.isSimulated()) {
            let pixelToShow = (this.state.position / 12.5).toFixed();
            for (let i = 23; i >= 16; i--) {
                if (i <= (23 - pixelToShow)) {
                    this.strip.pixel(i).color(this.configuration.dayLightColorCode);
                    this.strip.pixel((i - 8)).color(this.configuration.dayLightColorCode);
                    this.strip.pixel((i - 16)).color(this.configuration.dayLightColorCode);
                } else {
                    this.strip.pixel(i).color("#000000");
                    this.strip.pixel(i - 8).color("#000000");
                    this.strip.pixel(i - 16).color("#000000");
                }
            }
            this.strip.show();
            //this.publishStateChange();
        }
    };

    /**
     *
     */
    Jalousie.prototype.up = function (pretarget) {
        this.stopMotion();

        this.logDebug("Jalousie Moving up");
        var target = {};
        if (typeof pretarget === "undefined") {
            target.position = 0;
        } else {
            target = pretarget;
        }

        this.upInterval = setInterval(function () {
            this.state.position -= 12.5;
            this.publishStateChange();
            this.showPixel();

            if (this.state.position <= 0) {
                clearInterval(this.upInterval);
            }

        }.bind(this), this.configuration.speed);
    };

    /**
     *
     */
    Jalousie.prototype.down = function (pretarget) {
        this.stopMotion();

        this.logDebug("Jalousie Moving down");

        var target = {};
        if (typeof pretarget === "undefined") {
            target.position = 100;
        } else {
            target = pretarget;
        }

        this.downInterval = setInterval(function () {
            this.state.position += 12.5;
            this.logDebug(this.state);
            this.publishStateChange();
            this.showPixel();

            console.log("actual state " + this.state.position);

            if (this.state.position >= 100) {
                clearInterval(this.downInterval);
            }

        }.bind(this), this.configuration.speed);
    };

    /**
     *
     */
    Jalousie.prototype.stopMotion = function () {
        if (this.upInterval) {
            clearInterval(this.upInterval);
        }

        if (this.downInterval) {
            clearInterval(this.downInterval);
        }

    };

    /**
     *
     */
    Jalousie.prototype.stop = function () {
        this.stopMotion();
        return this.state;
    };

}

