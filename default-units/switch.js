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

        this.operationalState = {
            status: 'PENDING',
            message: 'Waiting for initialization...'
        };
        this.publishOperationalStateChange();

        this.state = {};

        if (!this.isSimulated()) {
            try {

                var five = require("johnny-five");

                this.switch = new five.Switch({
                    pin: this.configuration.pin,
                    type: this.type
                });

                this.operationalState = {
                    status: 'OK',
                    message: 'Switch successfully initialized'
                }
                this.publishOperationalStateChange();
                
                deferred.resolve();
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
                message: 'Switch successfully initialized'
            }
            this.publishOperationalStateChange();

            deferred.resolve();
        }




        this.switch.on("open", function () {

            if (this.state.switchState){
                this.state.switchState = true;
                this.publishValueChangeEvent({switchState : this.state.switchState});
            }

        }.bind(this));


        this.switch.on("close", function () {

            if (this.state.switchState){
                this.state.switchState = false;
                this.publishValueChangeEvent({switchState : this.state.switchState});
            }

        }.bind(this));

        return deferred.promise;

    };


    Switch.prototype.getState = function () {
        return this.state;
    };
}
