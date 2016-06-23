module.exports = {
    metadata: {
        plugin: "lcd",
        label: "LCD Display",
        role: "actor",
        family: "textDisplay",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "clear",
            label: "Clear",
            parameters: []
        }, {
            id: "print",
            label: "Print",
            parameters: [{
                label: "Text",
                id: "text",
                type: {
                    id: "string"
                }
            }]
        }, {
            id: "cursorAt",
            label: "Cursor At",
            parameters: [{
                label: "Row",
                id: "row",
                type: {
                    id: "integer"
                }
            }, {
                label: "Column",
                id: "column",
                type: {
                    id: "integer"
                }
            }]
        }],
        state: [{
            id: "text",
            label: "Text",
            type: {
                id: "string"
            }
        }, {
            id: "row",
            label: "Row",
            type: {
                id: "integer"
            }
        }, {
            id: "column",
            label: "Column",
            type: {
                id: "integer"
            }
        }],
        configuration: [{
            label: "RS Pin",
            id: "rsPin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "8"
        }, {
            label: "EN Pin",
            id: "enPin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "9"
        }, {
            label: "DB4 Pin",
            id: "db4Pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "4"
        }, {
            label: "DB5 Pin",
            id: "db5Pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "5"
        }, {
            label: "DB6 Pin",
            id: "db6Pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "6"
        }, {
            label: "DB7 Pin",
            id: "db7Pin",
            type: {
                family: "reference",
                id: "digitalInOutPin"
            },
            defaultValue: "7"
        }, {
            label: "Backlit",
            id: "backlit",
            type: {
                id: "integer"
            },
            defaultValue: "18"
        }]
    },
    create: function () {
        return new Lcd();
    }
};

var q = require('q');

/**
 *
 */
function Lcd() {
    /**
     *
     */
    Lcd.prototype.start = function (app, io) {
        var deferred = q.defer();

        if (!this.configuration.rows) {
            this.configuration.rows = 2;
        }

        if (!this.configuration.columns) {
            this.configuration.columns = 16;
        }

        this.state = {
            text: null,
            column: 0,
            row: 0
        }

        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.lcd = new five.LCD({
                    pins: [this.configuration.rsPin,
                        this.configuration.enPin,
                        this.configuration.db4Pin,
                        this.configuration.db5Pin,
                        this.configuration.db6Pin,
                        this.configuration.db7Pin]
                    // Options:
                    // bitMode: 4 or 8, defaults to 4
                    // lines: number of lines, defaults to 2
                    // dots: matrix dimensions, defaults to
                    // "5x8"
                    // bitMode: this.configuration.bitMode,
                    // lines: this.configuration.noOfLines,
                    // dots: this.configuration.matrix
                    // backlit : self.configuration.backlit
                });

                deferred.resolve();
            } catch (error) {
                console.error("Cannot initialize real LCD: "
                + error);

                deferred.reject("Cannot initialize LCD: " + error);
            }
        }
        else {
            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    Lcd.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Lcd.prototype.setState = function (state) {
        this.state = state;

        if (this.lcd) {
            this.lcd.cursor(this.state.row, this.state.column);
            this.lcd.print(this.state.text);
        }
    };

    /**
     *
     */
    Lcd.prototype.clear = function () {
        this.state.text = null;
        this.state.row = 0;
        this.state.column = 0;

        if (this.lcd) {
            this.lcd.clear();
        }

        this.publishStateChange();
    };

    /**
     *
     */
    Lcd.prototype.print = function (parameters) {
        if (!parameters.text || parameters.text.length == 0) {
            return;
        }

        // In case a number was submitted

        parameters.text = new String(parameters.text);

        if (this.lcd) {
            this.lcd.print();
        }

        this.publishStateChange();
    };

    /**
     *
     */
    Lcd.prototype.cursorAt = function (parameters) {
        this.state.column = parameters.column;
        this.state.row = parameters.row;

        if (this.lcd) {
            this.lcd.cursor(this.state.row, this.state.column);
        }

        this.publishStateChange();
    };
}