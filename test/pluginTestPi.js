var q = require('q');
var assert = require("assert");


describe('[thing-it] Microcontoller -> Raspberry', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "none"});

        testDriver.registerDevicePlugin(__dirname + "/../microcontroller");
        testDriver.start({
            configuration: require("../examples/configurationPiDevice.js"),
            heartbeat: 10
        });
    });

    describe('Device', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have completed initialization successfully', function (done) {
                testDriver.microcontroller1.board.on("ready",(function() {
                    done();
                }));
            });
        });
    });

    after(function () {
        testDriver.stop();
    });
});
