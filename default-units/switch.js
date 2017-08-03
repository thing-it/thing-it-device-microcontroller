module.exports = {
    metadata: {
        plugin: "switch",
        label: "Switch",
        role: "sensor",
        family: "switch",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [],
        state: [{
            id: "switchState",
            label: "Switch State",
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
        },{
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
        return new Switch();
    }
};

var q = require('q');

/**
 *
 */
function Switch() {
    /**
     *
     */
    Switch.prototype.start = function () {

        var deferred = q.defer();

        this.state = {};

        if (!this.isSimulated()) {
            try {

                var five = require("johnny-five");

                this.switch = new five.Switch({
                    pin: this.configuration.pin,
                    type: this.type
                });

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


        var self = this;

        this.switch.on("open", function () {

            if (!self.state.switchState){
                self.state.switchState = true;
                self.publishValueChangeEvent(self.state.switchState);
            }

        });


        this.switch.on("close", function () {

            if (self.state.switchState){
                self.state.switchState = false;
                self.publishValueChangeEvent(self.state.switchState);
            }

        });

        return deferred.promise;

    };


    Switch.prototype.getState = function () {
        return this.state;
    };
}