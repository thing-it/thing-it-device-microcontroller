angular.module('testApp', ['ThingItMobile.PluginDirectives'])
    .controller('TestController', function () {
        this.led = {
            _state: {
                light: "on"
            }
        };


        this.gate = {
            _state: {
                gateStatus: false
            },

            openForTime: function () {
                this.gate._state.gateStatus = !this.gate._state.gateStatus;
            }
        };


        this.panel = {
            callActorService: function (controllerObject, controllerFunction, valueToSet) {
                console.log('Hellooooooo!!!!!');
                controllerObject[controllerFunction](valueToSet)
            }
        }

    });