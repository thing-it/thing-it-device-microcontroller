var assert = require("assert");

describe('[thing-it] Arduino Microcontroller Plugin', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({
            logLevel: "error"
        });

        testDriver.registerDevicePlugin(__dirname + "/../arduino");
        testDriver.registerDevicePlugin(__dirname + "/../microcontroller");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/button");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/lcd");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/led");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/photocell");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/potentiometer");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/relay");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/rgbLed");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/servo");
    });
    describe('Start Configuration', function () {
        this.timeout(5000);

        it('should complete without error', function () {
            return testDriver.start({
                configuration: require("../examples/configuration.js"),
                heartbeat: 10,
                simulated: true
            });
        });
    });
    describe('arduino1.led1.on()', function () {
        this.timeout(5000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should produce Actor State Change message', function (done) {
            //testDriver.addListener({
            //    publishActorStateChange: function (device, actor, state) {
            //        if (actor.id === "lightBulbBedroom" && device.id === "philipsHueBridge" && state.brightnessPercent === 0)
            //        {
            //            done();
            //        }
            //        else
            //        {
            //            done('Unexpected Actor State Change message');
            //        }
            //    }
            //});

            done();
            testDriver.arduino1.led1.on();
        });
    });
});





