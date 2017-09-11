module.exports = {
    metadata: {
        family: "microcontroller",
        superDevice: "microcontroller/microcontroller",
        plugin: "microcontroller",
        label: "GPIO Microcontroller",
        connectionTypes: ["USB", "ZigBee", "Ethernet", "Wifi", "Built-in"],
        dataTypes: {
            digitalInOutPin: {//TODO Add Microcontroller typ for differend IO types
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
            },
            boardType: {
                family: "enumeration",
                values: [{
                    id: "RASPBERRY",
                    label: "Raspberry Pi"
                }, {
                    id: "ARDUINO",
                    label: "Arduino"
                }]
            }
        },
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: [{
            label: "Board Type",
            id: "boardType",
            type: {
                family: "reference",
                id: "boardType"
            },
            defaultValue: "RASPBERRY"
        }]
    },


    create: function (device) {
        return new Microcontroller();
    }
};

var q = require('q');
var {exec} = require('child_process');

function Microcontroller() {
    /**
     *
     */

    Microcontroller.prototype.start = function () {
        var deferred = q.defer();

        this.logLevel = 'debug';

        if (this.isSimulated()) {
            deferred.resolve();
        } else {
            var five = require("johnny-five");

            this.logDebug(this.configuration);


            var cleanUp = function () {
                var promise = new Promise(function (resolve, reject) {

                    switch (this.configuration.boardType) {

                        case "RASPBERRY":
                            this.logDebug("Clean Up -> Raspberry Pi.");

                            exec('sudo rm -r /var/run/pigpio.pid', (err, stdout, stderr) => {
                                if (err) {
                                    this.logDebug(`No pgpio deamon to release : ${err}`);
                                    resolve();
                                    return;
                                }
                                this.logDebug(`pgpio deamon released:  ${stdout}`);
                                resolve();
                            });

                            break;

                        case "ARDUINO":
                            this.logDebug("Clean Up-> Arduino");
                            resolve();
                            break;
                    }
                }.bind(this));

                return promise;

            }.bind(this);


            var bindBoard = function () {
                var promise = new Promise(function (resolve, reject) {

                    switch (this.configuration.boardType) {

                        case "RASPBERRY":
                            this.logDebug("Bind Microcontroller Board -> Raspberry Pi.");

                            var Raspi = require("raspi-io");

                            this.board = new five.Board({
                                io: new Raspi(),
                                repl: false //must set to false when j5 is running as subprocess. prevented issue with unhandled signal in systemd service
                            });
                            resolve();
                            break;

                        case "ARDUINO":
                            this.logDebug("Bind Microcontroller Board -> Arduino");

                            this.board = new five.Board();
                            resolve();
                            break;
                    }


                }.bind(this));
                return promise;
            }.bind(this);

            var addListener = function () {
                var promise = new Promise(function (resolve, reject) {

                    this.board.on("ready", function () {
                        this.logDebug("Microcontroller ready.");

                        this.publishStateChange();

                        resolve(deferred.resolve());

                    }.bind(this));

                    this.board.on("fail", function (error) {
                        this.logError(error);

                        reject(deferred.reject(error));

                    }.bind(this));


                }.bind(this));

                return promise;
            }.bind(this);



            cleanUp().then(bindBoard).then(addListener);


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

    /**
     *
     */

    Microcontroller.prototype.stop = function () {


        this.board.io.reset()
        //TODO implement after adding to firmata -> https://github.com/rwaldron/johnny-five/issues/617

    };

    /**
     *
     */
}
