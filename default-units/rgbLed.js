module.exports = {
    metadata: {
        plugin: "rgbLed",
        label: "LED (RGB)",
        role: "actor",
        family: "coloredLight",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "on",
            label: "On"
        }, {
            id: "off",
            label: "Off"
        }, {
            id: "blink",
            label: "Blink"
        }, {
            id: "color",
            label: "Color",
            parameters: [{
                label: "RGB-Color (hex.)",
                id: "rgbColorHex",
                type: {
                    id: "string"
                }
            }]
        }, {
            id: "setRedValue",
            label: "Set Red Value",
            parameters: [{
                label: "Red Value",
                id: "value",
                type: {
                    id: "integer"
                }
            }]
        }, {
            id: "setGreenValue",
            label: "Set Green Value",
            parameters: [{
                label: "Green Value",
                id: "value",
                type: {
                    id: "integer"
                }
            }]
        }, {
            id: "setBlueValue",
            label: "Set Blue Value",
            parameters: [{
                label: "Blue Value",
                id: "value",
                type: {
                    id: "integer"
                }
            }]
        }],
        state: [{
            id: "blink",
            label: "Blink",
            type: {
                id: "boolean"
            }
        }, {
            id: "red",
            label: "Red",
            type: {
                id: "integer"
            }
        }, {
            id: "green",
            label: "Green",
            type: {
                id: "integer"
            }
        }, {
            id: "blue",
            label: "Blue",
            type: {
                id: "integer"
            }
        }],
        configuration: [{
            label: "Pin (Red)",
            id: "pinRed",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "12"
        }, {
            label: "Pin (Green)",
            id: "pinGreen",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "13"
        }, {
            label: "Pin (Blue)",
            id: "pinBlue",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "14"
        }]
    },
    create: function () {
        return new RgbLed();
    }
};

var q = require('q');

/**
 *
 */
function RgbLed() {
    /**
     *
     */
    RgbLed.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            red: 0,
            green: 0,
            blue: 0,
            hex: "#000000"
        };

        var self = this;

        if (!self.isSimulated()) {
            try {
                var five = require("johnny-five");

                self.led = new five.Led.RGB({
                    pins: {
                        red: self.configuration.pinRed,
                        green: self.configuration.pinGreen,
                        blue: self.configuration.pinBlue
                    }
                });
                self.led.stop().off();
            } catch (error) {
                console.trace(error);

                self.device.node
                    .publishMessage("Cannot initialize "
                    + self.device.id + "/" + self.id
                    + ":" + x);
            }
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    RgbLed.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    RgbLed.prototype.setState = function (state) {
        this.state = state;

        this.state.hex = rgbToHex(this.state.red, this.state.green,
            this.state.blue);

        if (this.led) {
            this.led.on();
            this.led.color(this.state.hex);

            if (this.state.blink) {
                this.led.blink();
            }
        }

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.on = function () {
        if (this.led) {
            this.led.on();
        }

        this.state = {
            red: 255,
            green: 255,
            blue: 255,
            hex: "#FFFFFF"
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.off = function () {
        if (this.led) {
            this.led.stop().off();
        }

        this.state = {
            red: 0,
            green: 0,
            blue: 0,
            hex: "#000000"
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.color = function (parameters) {
        if (this.led) {
            this.led.color(parameters.rgbColorHex);
        }

        var rgb = hexToRgb(parameters.rgbColorHex);

        this.state = {
            red: rgb.r,
            green: rgb.g,
            blue: rgb.b,
            hex: parameters.rgbColorHex
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.setRedValue = function (parameters) {
        if (this.led) {
            this.led.color(rgbToHex(Math.min(parameters.value, 255),
                this.state.green, this.state.blue));
        }

        this.state = {
            red: Math.min(parameters.value, 255),
            green: this.state.green,
            blue: this.state.blue,
            hex: rgbToHex(Math.min(parameters.value, 255), this.state.green,
                this.state.blue)
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.setGreenValue = function (parameters) {
        if (this.led) {
            this.led.color(rgbToHex(this.state.red, Math.min(parameters.value,
                255), this.state.blue));
        }

        this.state = {
            red: this.state.red,
            green: Math.min(parameters.value, 255),
            blue: this.state.blue,
            hex: rgbToHex(this.state.red, Math.min(parameters.value, 255),
                this.state.blue)
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.setBlueValue = function (parameters) {
        if (this.led) {
            this.led.color(rgbToHex(this.state.red, this.state.green, Math.min(
                parameters.value, 255)));
        }

        this.state = {
            red: this.state.red,
            green: this.state.green,
            blue: Math.min(parameters.value, 255),
            hex: rgbToHex(this.state.red, this.state.green, Math.min(
                parameters.value, 255))
        };

        this.publishStateChange();
    };

    /**
     *
     */
    RgbLed.prototype.blink = function () {
        if (this.led) {
            this.led.blink();
        }

        this.state.blink = true;

        this.publishStateChange();
    };
};

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

/**
 *
 * @param r
 * @param g
 * @param b
 * @returns {String}
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
