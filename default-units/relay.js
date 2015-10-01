module.exports = {
    metadata: {
        plugin: "relay",
        label: "Relay",
        role: "actor",
        family: "relay",
        deviceTypes: ["microcontroller/microcontroller"],
        services: [{
            id: "open",
            label: "Open"
        }, {
            id: "close",
            label: "Close"
        }, {
            id: "toggle",
            label: "Toggle"
        }],
        state: [{
            id: "gate",
            label: "Gate",
            type: {
                id: "boolean"
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
            label: "Type",
            id: "type",
            type: {
                family: "enumeration",
                values: [{
                    label: "Normally Open",
                    id: "NO"
                }, {
                    label: "Normally Close",
                    id: "NC"
                }]
            }
        }]
    },
    create: function () {
        return new Relay();
    }
};

var q = require('q');

/**
 *
 */
function Relay() {
    /**
     *
     */
    Relay.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            gate: false
        };

        if (!this.isSimulated()) {
            try {
                var five = require("johnny-five");

                this.relay = new five.Relay(this.configuration.pin,
                    this.configuration.type);

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
    Relay.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Relay.prototype.setState = function (state) {
        this.state = state;

        if (this.relay) {
            if (this.state.gate == true) {
                this.relay.open();
            } else {
                this.relay.close();
            }
        }
    };

    /**
     *
     */
    Relay.prototype.open = function () {
        if (this.relay) {
            this.relay.open();
        }

        this.state.gate = true;

        this.publishStateChange();
    };

    /**
     *
     */
    Relay.prototype.close = function () {
        if (this.relay) {
            this.relay.close();
        }

        this.state.gate = false;

        this.publishStateChange();
    };

    /**
     *
     */
    Relay.prototype.toggle = function () {
        if (this.state.gate) {
            this.close();
        } else {
            this.open();
        }
    }
};
