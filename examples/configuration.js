module.exports = {
    uuid: "791cb970-d408-11e4-b424-7b0ff9c5b77e",
    label: "Home",
    id: "home",
    devices: [{
        label: "Microcontroller Uno 1",
        id: "arduino1",
        plugin: "microcontroller/arduino",
        configuration: {},
        actors: [{
            id: "led1",
            label: "LED1",
            type: "led",
            configuration: {
                "pin": 12
            }
        }, {
            id: "led2",
            label: "LED2",
            type: "led",
            configuration: {
                "pin": 13
            }
        }],
        sensors: [{
            id: "button1",
            label: "Button 1",
            type: "button",
            configuration: {
                "pin": 2
            }
        }, {
            id: "button2",
            label: "Button 2",
            type: "button",
            configuration: {
                "pin": 4
            }
        }, {
            id: "photocell1",
            label: "Photocell 1",
            type: "photocell",
            configuration: {
                "pin": "A0",
                "rate": 2000
            }
        }]
    }],
    groups: [{
        id: "group1",
        label: "320, Whitman Park Drive",
        icon: "home",
        subGroups: [{
            id: "group2",
            label: "Dining Room",
            icon: "cutlery",
            subGroups: [],
            actors: ["arduino1.led1", "arduino1.led2"],
            sensors: ["arduino1.button1", "arduino1.button2",
                "arduino1.photocell1"],
            services: ["toggleAll"]
        }]
    }],
    services: [{
        id: "toggleAll",
        label: "Toggle All",
        type: "script",
        content: {
            script: "if (arduino1.led1.state.light == 'on') {arduino1.led1.off(); arduino1.led2.off();} else {arduino1.led1.on(); arduino1.led2.on();}"
        }
    }],
    eventProcessors: [
        {
            id: "eventProcessor1",
            label: "Event Processor 1",
            observables: ["arduino1.button1"],
            match: "arduino1.button1.event.type == 'hold'",
            type: "script",
            content: {
                script: "if (arduino1.led1.state.light == 'on') {arduino1.led1.off(); } else {arduino1.led1.on();}"
            }
        },
        {
            id: "eventProcessor2",
            label: "Event Processor 2",
            observables: ["arduino1.button2"],
            match: "arduino1.button2.event.type == 'hold'",
            type: "script",
            content: {
                script: "if (arduino1.led2.state.light == 'on') {arduino1.led2.off(); } else {arduino1.led2.on();}"
            }
        },
        {
            id: "eventProcessor3",
            label: "Event Processor 3",
            observables: ["arduino1.photocell1"],
            window: {
                "duration": 10000
            },
            match: "minimum(arduino1.photocell1.series) < 700 && deviation(arduino1.photocell1.series) < 100 && arduino1.photocell1.series.length > 1",
            type: "script",
            content: {
                script: "arduino1.led1.on(); arduino1.led2.on();"
            }
        }],
    data: []
};
