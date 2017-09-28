module.exports = {
    metadata: {
        plugin: "pixel",
        label: "Pixel",
        role: "actor",
        family: "lights",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "setAllPixel",
            label: "Set all Pixel",
            parameters: [{
                id: "hexColor",
                label: "Hex Color",
                type: {id: "string"}
            }]
        }, {
            id: "setPixel",
            label: "Set Pixel",
            parameters: [{
                id: "position",
                label: "Position",
                type: {id: "integer"}
            }, {
                id: "red",
                label: "Red",
                type: {id: "integer"}
            }, {
                id: "green",
                label: "Green",
                type: {id: "integer"}
            }, {
                id: "blue",
                label: "Blue",
                type: {id: "integer"}
            },]
        }, {
            id: "loading",
            label: "Loading",
        }],
        state: [{
            id: "light",
            label: "Light",
            type: {
                id: "string"
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
            label: "Number",
            id: "number",
            type: {
                id: "integer"
            },
            defaultValue: 0
        }, {
            label: "Clone",
            id: "clone",
            type: {
                id: "integer"
            },
            defaultValue: 0
        }]
    },
    create: function () {
        return new Pixel();
    }
};

var q = require('q');

/**
 *
 */
function Pixel() {
    /**
     *
     */
    Pixel.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            light: "off"
        };

        if (!this.isSimulated()) {

            try {

                var pixel = require("node-pixel");


                this.strip = new pixel.Strip({
                    board: this.device.board,
                    controller: "FIRMATA",
                    strips: [{
                        pin: this.configuration.pin,
                        length: (this.configuration.number * this.configuration.clone)
                    },], // this is preferred form for definition
                    gamma: 2.8, // set to a gamma that works nicely for WS2812
                });

                console.log(this.strip.length);

                this.strip.on("ready", function () {
                    console.log("Pixel controller ready");
                    this.off();

                    deferred.resolve();
                }.bind(this));

                console.log("Pixel initialized.");


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
    Pixel.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Pixel.prototype.setState = function (state) {

    };

    /**
     *
     */
    Pixel.prototype.on = function () {

    };

    /**
     *
     */
    Pixel.prototype.off = function () {


        if (this.strip) {
            this.strip.off();
        }

        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }

        this.publishStateChange();

    };

    /**
     *
     */
    Pixel.prototype.loading = function (parameters) {
        var pixel = require("node-pixel");
        this.off();

        this.strip.pixel(0).color(rgbToHex(parseInt(parameters.red * 0.3), parseInt(parameters.green * 0.3), parseInt(parameters.blue * 0.3)));
        this.strip.pixel(1).color(rgbToHex(parseInt(parameters.red * 0.5), parseInt(parameters.green * 0.5), parseInt(parameters.blue * 0.5)));
        this.strip.pixel(2).color(rgbToHex(parameters.red, parameters.green, parameters.blue));

        this.showPixel();


        this.loadingInterval = setInterval(function () {

            this.strip.shift(1, pixel.FORWARD, true);

            this.showPixel();

            if (this.strip.pixel(this.configuration.number).color().hexcode === rgbToHex(parameters.red, parameters.green, parameters.blue).toUpperCase()) {

                this.strip.off();

                this.strip.pixel(0).color(rgbToHex(parseInt(parameters.red * 0.3), parseInt(parameters.green * 0.3), parseInt(parameters.blue * 0.3)));
                this.strip.pixel(1).color(rgbToHex(parseInt(parameters.red * 0.5), parseInt(parameters.green * 0.5), parseInt(parameters.blue * 0.5)));
                this.strip.pixel(2).color(rgbToHex(parameters.red, parameters.green, parameters.blue));

                this.showPixel();
            }

        }.bind(this), 1000 / parameters.speed);


    };

    /**
     *
     */
    Pixel.prototype.setPixel = function (parameters) {

        this.strip.pixel(parameters.position).color(rgbToHex(parameters.red, parameters.green, parameters.blue));

        this.showPixel();

    };

    /**
     *
     */
    Pixel.prototype.setAllPixel = function (parameters) {

        for (var i = 0; i < this.configuration.number; i++) {
            this.strip.pixel(i).color(parameters.hexColor);
        }

        this.showPixel();

    };


    /**
     *
     */
    Pixel.prototype.showPixel = function (parameters) {

        for (var c = 0; c < this.configuration.clone; c++) {
            for (var i = 0; i < this.configuration.number; i++) {
                this.strip.pixel((parseInt(i) + (parseInt(this.configuration.number) * c))).color(this.strip.pixel(i).color().hexcode);
            }
        }

        this.strip.show();
    };

};


/**
 *
 * @param r
 * @param g
 * @param b
 * @returns {String}
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (Math.min(r, 255) << 16) + (Math.min(g, 255) << 8) + Math.min(b, 255)).toString(16).slice(1);
}
