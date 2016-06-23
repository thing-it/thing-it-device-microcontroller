module.exports = {
    metadata: {
        family: "microcontroller",
        superDevice: "microcontroller/microcontroller",
        plugin: "microcontroller",
        label: "GPIO Microcontroller",
        connectionTypes: ["USB", "ZigBee", "Ethernet", "Wifi", "Built-in"],
        dataTypes: {
            digitalInOutPin: {
                family: "enumeration",
                values: [{
                    id: "0",
                    label: "0"
                }, {
                    id: "1",
                    label: "1"
                }, {
                    id: "2",
                    label: "2"
                }, {
                    id: "3",
                    label: "3"
                }, {
                    id: "4",
                    label: "4"
                }, {
                    id: "5",
                    label: "5"
                }, {
                    id: "6",
                    label: "6"
                }, {
                    id: "7",
                    label: "7"
                }, {
                    id: "8",
                    label: "8"
                }, {
                    id: "9",
                    label: "9"
                }, {
                    id: "10",
                    label: "10"
                }, {
                    id: "11",
                    label: "11"
                }, {
                    id: "12",
                    label: "12"
                }, {
                    id: "13",
                    label: "13"
                }]
            },
            analogInPin: {
                family: "enumeration",
                values: [{
                    id: "A0",
                    label: "A0"
                }, {
                    id: "A1",
                    label: "A1"
                }, {
                    id: "A2",
                    label: "A2"
                }, {
                    id: "A3",
                    label: "A3"
                }, {
                    id: "A4",
                    label: "A4"
                }, {
                    id: "A5",
                    label: "A5"
                }]
            }
        },
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: [] // TODO Add Connection Type
    },
    create: function (device) {
        return new Microcontroller();
    }
};

var q = require('q');

function Microcontroller() {
    /**
     *
     */
    Microcontroller.prototype.start = function () {
        var deferred = q.defer();

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            var five = require("johnny-five");

            this.logDebug("Bind Microcontroller.");

            this.board = new five.Board();

            this.board.on("ready", function () {
                this.logDebug("Microcontroller ready.");

                this.publishStateChange();

                deferred.resolve();
            }.bind(this));

            this.board.on("fail", function (error) {
                this.logError(error);

                deferred.reject(error);
            }.bind(this));
        }

        return deferred.promise;
    };

    /**
     *
     */
    Microcontroller.prototype.getState = function () {
        return {};
    };

    /**
     *
     */
    Microcontroller.prototype.setState = function () {
    };
}
