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
            parameters: [{
                id: "speed",
                label: "Speed",
                type: {id: "integer"}
            }, {
                id: "hexColor",
                label: "Hex Color",
                type: {id: "string"}
            }]
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

        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

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


                this.operationalState = {
                    status: 'OK',
                    message: 'Pixel successfully initialized'
                }
                this.publishOperationalStateChange();

                    deferred.resolve();
                }.bind(this));

                console.log("Pixel initialized.");


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
                message: 'Pixel successfully initialized'
            }
            this.publishOperationalStateChange();

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
        this.state = state;
    };

    /**
     *
     */
    Pixel.prototype.on = function () {
        this.state.light = "on";
        this.publishStateChange();
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

        this.state.light = "off";
        this.publishStateChange();

    };

    /**
     *
     */
    Pixel.prototype.loading = function (parameters) {
        var pixel = require("node-pixel");

        if (!this.isSimulated()) {

            this.off();

            var rgb = hexToRgb(parameters.hexColor);


            this.strip.pixel(0).color(rgbToHex(parseInt(rgb.r * 0.3), parseInt(rgb.g * 0.3), parseInt(rgb.b * 0.3)));
            this.strip.pixel(1).color(rgbToHex(parseInt(rgb.r * 0.5), parseInt(rgb.g * 0.5), parseInt(rgb.b * 0.5)));
            this.strip.pixel(2).color(rgbToHex(rgb.r, rgb.g, rgb.b));

            this.showPixel();


            this.loadingInterval = setInterval(function () {

                this.strip.shift(1, pixel.FORWARD, true);

                this.showPixel();

                if (this.strip.pixel(this.configuration.number).color().hexcode === rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase()) {

                    this.strip.off();

                    this.strip.pixel(0).color(rgbToHex(parseInt(rgb.r * 0.3), parseInt(rgb.g * 0.3), parseInt(rgb.b * 0.3)));
                    this.strip.pixel(1).color(rgbToHex(parseInt(rgb.r * 0.5), parseInt(rgb.g * 0.5), parseInt(rgb.b * 0.5)));
                    this.strip.pixel(2).color(rgbToHex(rgb.r, rgb.g, rgb.b));

                    this.showPixel();
                }

            }.bind(this), 1000 / parameters.speed);
        }


    };

    /**
     *
     */
    Pixel.prototype.setPixel = function (parameters) {

        if (!this.isSimulated()) {
            this.strip.pixel(parameters.position).color(rgbToHex(parameters.red, parameters.green, parameters.blue));

            this.showPixel();
        }

        if (!parameters || parameters.hexColor == "#000000") {
            this.off();
        } else {
            this.on();
        }

    };

    /**
     *
     */
    Pixel.prototype.setAllPixel = function (parameters) {

        if (!this.isSimulated()) {
            for (var i = 0; i < this.configuration.number; i++) {
                this.strip.pixel(i).color(parameters.hexColor);
            }

            this.showPixel();
        }

        if (!parameters || parameters.hexColor == "#000000") {
            this.off();
        } else {
            this.on();
        }

    };


    /**
     *
     */
    Pixel.prototype.showPixel = function (parameters) {

        if (!this.isSimulated()) {

            for (var c = 0; c < this.configuration.clone; c++) {
                for (var i = 0; i < this.configuration.number; i++) {
                    this.strip.pixel((parseInt(i) + (parseInt(this.configuration.number) * c))).color(this.strip.pixel(i).color().hexcode);
                }
            }

            this.strip.show();
        }
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


/**
 *
 * @param hex
 * @returns
 */
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")

    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}