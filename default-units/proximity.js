module.exports = {
    metadata: {
        plugin: "proximity",
        label: "Proximity",
        role: "sensor",
        family: "proximity",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [{
            id: "objectDetectionStarted",
            label: "Object detection started"
        }],
        services: [{
            id: "setThreshold",
            label: "Set Threshold",
            parameters: [{
                label: "Distance",
                id: "distance",
                type: {
                    id: "string"
                }
            }, {
                label: "Time in Seconds",
                id: "time",
                type: {
                    id: "integer"
                }

            }, {
                label: "Tolerance in cm",
                id: "tolerance",
                type: {
                    id: "integer"
                }

            }]
        }, {
            id: "checkRange",
            label: "Check Range"
        }],
        state: [{
            id: "objectInRange",
            label: "Object in Range",
            type: {
                id: "boolean"
            }
        }, {
            id: "distanceCM",
            label: "Distance cm",
            type: {
                id: "integer"
            }
        }, {
            id: "thresholdCM",
            label: "Threshold cm",
            type: {
                id: "integer"
            }
        }, {
            id: "thresholdTime",
            label: "Threshold Time",
            type: {
                id: "integer"
            }
        }, {
            id: "tolerance",
            label: "Tolerance in cm",
            type: {
                id: "integer"
            }
        }],
        configuration: [{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "SRF10",
                    id: "SRF10"
                }]
            }
        }, {
            id: "frequenz", //TODO Unused....
            label: "Frequenz",
            type: {
                id: "integer"
            }
        }, {
            id: "tresholdCM",
            label: "Treshold in cm",
            type: {
                id: "integer"
            }
        }, {
            id: "tresholdTime",
            label: "Treshold time in seconds",
            type: {
                id: "integer"
            }
        }, {
            id: "tolerance",
            label: "Tolerance in cm",
            type: {
                id: "integer"
            }
        }]
    },
    create: function () {
        return new Proximity();
    }
};

var q = require('q');

/**
 *
 */
function Proximity() {
    /**
     *
     */
    Proximity.prototype.start = function () {
        var deferred = q.defer();

        this.logLevel = 'debug';

        //this.state.distanceCM = 0;
        //this.state.tresholdCM = 0;


        this.state = {
            objectInRange: false,
            distanceCM: 0,
            thresholdCM: 0,
            thresholdTime: 0,
            tolerance: 0
        };


        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.proximity = new five.Proximity({
                    controller: "SRF10",
                    freq: 1000,
                });

                this.state.tresholdCM = this.configuration.tresholdCM;
                this.state.tresholdTime = this.configuration.tresholdTime;
                this.state.tolerance = this.configuration.tolerance;

                deferred.resolve();

            } catch (error) {
                console.log("initialize Error of proximity");

                this.device.node
                    .publishMessage("Cannot initialize "
                        + this.device.id + "/" + this.id
                        + ":" + error);

                deferred.reject(error);
            }


            var sensorChanged = false;
            var firstDetection = false;
            var values = [];

            var self = this;

            this.proximity.on("data", function () {

                console.log("Proximity on cm: ", this.cm);

                if (sensorChanged) {

                    console.log("Sensor changed");
                    if (firstDetection) {
                        console.log("object gefunden");
                        self.publishEvent('objectDetectionStarted');



                        values = [];
                        firstDetection = false;
                    }

                    values.push(this.cm);

                    if (values.length === 10) {

                        var sum = values.reduce(function (a, b) {
                            return a + b;
                        });

                        self.state.distanceCM = sum / values.length;
                        self.checkRange();
                        sensorChanged = false;

                    }
                }

            });


            this.proximity.on("change", function () {

                sensorChanged = true;
                firstDetection = true;
                console.log("Proximity change cm: ", this.cm);

            });


        } else {
            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    Proximity.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Proximity.prototype.setState = function (state) {
        this.state = state;
        this.publishStateChange();
    };

    /**
     *
     */
    Proximity.prototype.setTreshold = function (parameters) {
        console.log("Service Call #######")
        if (this.proximity) {
            this.state.tresholdCM = parameters.distance;
            this.state.tresholdTime = parameters.time;
            this.state.tolerance = parameters.tolerance;
        }

        this.publishValueChangeEvent({
            tresholdCM: this.state.tresholdCM,
            tresholdTime: this.state.tresholdTime,
            tolerance: this.state.tolerance
        });
    };

    /**
     *
     */
    Proximity.prototype.checkRange = function () {
        console.log("check range");
        if (this.proximity && this.state.tresholdCM) {

            var currentObectInRangeValue = this.state.objectInRange;

            if (this.state.tresholdCM > this.state.distanceCM - this.state.tolerance && this.state.tresholdCM + this.state.tolerance) {

                this.state.objectInRange = true;
                console.log("event");

                if (currentObectInRangeValue != this.state.objectInRange) {
                    this.publishValueChangeEvent({
                        objectInRange: true
                    });
                }

            } else {
                this.state.objectInRange = false;

                if (currentObectInRangeValue != this.state.objectInRange) {
                    this.publishValueChangeEvent({
                        objectInRange: false
                    });
                }
            }
        }
    };

    /**
     *
     */
    Proximity.prototype.stop = function () {
        this.proximity = null;
    };
}