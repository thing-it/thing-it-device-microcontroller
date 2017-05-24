module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [{
        "id": "microcontroller1",
        "label": "GPIO Microcontroller 1",
        "plugin": "microcontroller/microcontroller",
        "configuration": {"boardType": "ARDUINO"},
        "actors": [{
            "id": "led1",
            "label": "LED 1",
            "type": "led",
            "configuration": {"pin": "1"}
        }, {
            "id": "gate1",
            "label": "Gate 1",
            "type": "gate",
            "configuration": {"pin": "4"}
        }],
        "sensors": []
    }],
    "services": [],
    "eventProcessors": [],
    "jobs": [],
    "groups": [],
    "data": []
};