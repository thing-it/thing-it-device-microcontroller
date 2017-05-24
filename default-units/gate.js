module.exports = {
    metadata: {
        plugin: "gate",
        label: "Gate",
        role: "actor",
        family: "gate",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "open",
            label: "Open"
        }, {
            id: "close",
            label: "Close"
        }, {
            id: "openForTime",
            label: "Open for Time"
        }],
        state: [{
            id: "gateStatus",
            label: "Gate Status",
            type: {
                id: "Boolean"
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
        }]
    },
    create: function () {
        return new Gate();
    }//
};

var q = require('q');

/**
 *
 */
function Gate() {
    /**
     *
     */
    Gate.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            gateStatus: false
        };

        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.led = new five.Led(this.configuration.pin);

                this.logDebug("Gate initialized.");

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

        return deferred.promise;
    };

    /**
     *
     */
    Gate.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Gate.prototype.setState = function (state) {
        this.state.gateStatus = state.gateStatus;

        if (this.led) {
            if (this.state.gateStatus) {
                this.led.on();
            } else {
                this.led.stop().off();
            }
        }
    };

    /**
     *
     */
    Gate.prototype.open = function () {
        if (this.led) {
            this.led.on();
        }

        this.state.gateStatus = true;
        this.publishStateChange();
    };

    /**
     *
     */
    Gate.prototype.openForTime = function () {
        if (this.led) {
            var that = this;
            this.open();
            setTimeout(function () {
                that.close();
            }, 10000);
        }
    };

    /**
     *
     */
    Gate.prototype.close = function () {
        if (this.led) {
            this.led.stop().off();
        }
        this.state.gateStatus = false;

        this.publishStateChange();
    };
}