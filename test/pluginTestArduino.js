var q = require('q');
var assert = require("assert");


describe('[thing-it] Microcontoller -> Arduino', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../microcontroller");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/led");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/gate");
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

            //TODO if no DEVICE present this works anyway. -> NOT GOOD!
            it('schould have completed LED actor injection successfully', function (done) {
                assert.ok(testDriver.microcontroller1.led1, 'LED not injected');
                done();
            });

        });

        describe('#function', function () {
            this.timeout(5000);

            it('schould have set the LED -> ON', function (done) {
                testDriver.microcontroller1.led1.on();
                assert.ok(testDriver.microcontroller1.led1.getState().light === "on", 'LED not set to ON');
                done();
            });

            it('schould have set the LED -> OFF', function (done) {
                testDriver.microcontroller1.led1.off();
                assert.ok(testDriver.microcontroller1.led1.getState().light === "off", 'LED not set to Off');
                done();
            });

            it('schould have set the LED -> BLINK', function (done) {
                testDriver.microcontroller1.led1.blink();
                assert.ok(testDriver.microcontroller1.led1.getState().light === "blink", 'LED not set to Off');
                done();
            });

            it('schould have TOGGLED the LED', function (done) {
                var previousState = testDriver.microcontroller1.led1.getState().light;
                testDriver.microcontroller1.led1.toggle();
                assert.notEqual(testDriver.microcontroller1.led1.getState().light, previousState, 'LED not set to ON');
                done();
            });

        });
    });


    describe('Actor -> GATE', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('schould have completed LED injection for GATE actor successfully', function (done) {
                assert.ok(testDriver.microcontroller1.gate1, 'Gate(LED) not injected');
                done();
            });

        });

        describe('#function', function () {
            this.timeout(15000);

            it('schould have set the GATE -> OPEN', function (done) {
                testDriver.microcontroller1.gate1.open();
                assert.ok(testDriver.microcontroller1.gate1.state.gateStatus, 'GATE not set to Open');
                done();
            });

            it('schould have set the GATE -> CLOSE', function (done) {
                testDriver.microcontroller1.gate1.close();
                assert.ok(!testDriver.microcontroller1.gate1.state.gateStatus, 'GATE not set to CLOSE');
                done();
            });

            it('schould have set the GATE -> OPEN FOR 10 Sec and then close', function (done) {


                testDriver.microcontroller1.gate1.openForTime();

                assert.ok((testDriver.microcontroller1.gate1.state.gateStatus), "gate did not open at the beginning of 10 seconds");

                setTimeout(function () {
                    assert.ok((!testDriver.microcontroller1.gate1.state.gateStatus), "gate was not closed after 10 seconds");
                    done();
                }, 11000);

            });

        });
    });


    after(function () {
        testDriver.stop();
    });
});

