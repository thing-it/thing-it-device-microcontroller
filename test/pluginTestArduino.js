var q = require('q');
var assert = require("assert");


describe('[thing-it] Microcontoller -> Arduino', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "none"});

        testDriver.registerDevicePlugin(__dirname + "/../microcontroller");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/led");

        testDriver.start({
            configuration: require("../examples/configurationArduinoDevice.js"),
            heartbeat: 10
        });
    });

    describe('Device', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have completed initialization successfully', function (done) {
                testDriver.microcontroller1.board.on("ready", (function () {
                    done();
                }));
            });
        });
    });



    describe('Actor -> LED', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('schould have completed actor injection successfully', function (done) {


            });
        });
    });


    after(function () {
        testDriver.stop();
    });
});
