module.exports = {
    metadata: {
        plugin: "proximity",
        label: "Proximity",
        role: "sensor",
        family: "proximity",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [{
            id: "objectInRange",
            label: "Object in Range"
        }],
        services: [{
            id: "setThreshold",
            label: "Set Threshold"
        }, {
            id: "checkRange",
            label: "checkRange"
        }],
        state: [{
            id: "distanceCM",
            label: "Distance cm",
            type: {
                id: "string"
            }
        }, {
            id: "distanceINCH",
            label: "Distance inch",
            type: {
                id: "string"
            }
        }, {
            id: "thresholdCM",
            label: "Threshold cm",
            type: {
                id: "string"
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
            id: "frequenz",
            label: "Frequenz",
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


        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.proximity = new five.Proximity({
                    controller: this.configuration.controller,
                    freq: this.configuration.frequenz
                });

                deferred.resolve();

            } catch (error) {
                this.device.node
                    .publishMessage("Cannot initialize "
                        + this.device.id + "/" + this.id
                        + ":" + error);

                deferred.reject(error);
            }
        }
        else {
            deferred.resolve();
        }


        this.proximity.on("change", function () {
            //this.logDebug("Proximity change inches: ", this.proximity.on.inches);
            this.logDebug("Proximity change cm: ", this.proximity.on.cm);

            this.state.distanceCM = this.proximity.on.cm;

            this.checkRange();


        }.bind(this));


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

    };

    /**
     *
     */
    Proximity.prototype.setTreshold = function () {

        if (this.proximity) {
            this.state.tresholdCM = this.state.distanceCM;
        }
        this.publishValueChangeEvent({tresholdCM: this.state.tresholdCM});
    };

    /**
     *
     */
    Proximity.prototype.checkRange = function () {

        if (this.proximity && this.state.tresholdCM) {

            if (this.state.tresholdCM > this.state.distanceCM) {
                this.publishEvent('objectInRange');
            }
        }
    };

    /**
     *
     */
    Proximity.prototype.close = function () {


    };


    /**
     *
     */
    Proximity.prototype.stop = function () {
        this.proximity = null;
    }
};
