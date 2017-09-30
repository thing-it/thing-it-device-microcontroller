var q = require('q');
var assert = require("assert");


describe('[thing-it] BACnet Device', function () {
    var testDriver;
    var initialState;
    var lastState;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../microcontroller");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/thermostat");
        testDriver.start({
            configuration: require("../examples/configurationThermostat.js"),
            // TODO Julian - remove the next line to test in non-simulated mode
            simulated: true,
            heartbeat: 10
        });

    });

    describe('Thermostat', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have an initial value for setpoint, temperature, and mode',
                function (done) {
                    setTimeout(function () {
                        var currentState = testDriver.microcontroller.thermostat.getState();
                        initialState = JSON.parse(JSON.stringify(currentState));

                        try {
                            assert.notEqual(initialState.setpoint, undefined, 'setpoint undefined');
                            assert.notEqual(initialState.temperature, undefined, 'temperature undefined');
                            assert.notEqual(initialState.mode, undefined, 'mode undefined');
                            done();
                        } catch (err) {
                            console.log('ERROR DEBUG pluginTestThermostat: Initial state after 5s.', initialState);
                            done(err);
                        }
                    }, 4000);
                });
        });

        describe('#incrementSetpoint', function () {
            it('should increase the setpoint modification and the setpoint by 1',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.setpoint += 1;

                    testDriver.microcontroller.thermostat.incrementSetpoint()
                        .then(function () {
                            console.log('Setpoing increase called.');
                            var resultingState = testDriver.microcontroller.thermostat.getState();
                            lastState = resultingState;
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#decrementSetpoint twice', function () {
            this.timeout(5000);

            it('should decrease the setpoint modification and the setpoint by 2',
                function (done) {
                    console.log('**************');
                    console.log(lastState);
                    console.log('**************');
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.setpoint -= 2;

                    testDriver.microcontroller.thermostat.decrementSetpoint()
                        .delay(1000)
                        .then(function () {
                            return testDriver.microcontroller.thermostat.decrementSetpoint();
                        })
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.microcontroller.thermostat.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#setState', function () {
            this.timeout(4000);

            it('should set the device back to the initial state',
                function (done) {
                    var desiredState = initialState;

                    testDriver.microcontroller.thermostat.setState(desiredState)
                        .then(function () {
                            var resultingState = testDriver.microcontroller.thermostat.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            assert.equal(resultingState.temperature, desiredState.temperature);
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });
    })


    after(function () {
        testDriver.stop();
    });
});