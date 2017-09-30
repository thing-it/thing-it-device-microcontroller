module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "simulated":"true",
    "devices": [{
        "id": "microcontroller",
        "label": "GPIO Microcontroller",
        "plugin": "microcontroller/microcontroller",
        "configuration": {"boardType": "RASPBERRY"},
        "actors": [{
            "id": "thermostat",
            "label": "Thermostat",
            "type": "thermostat",
            "logLevel": "debug",
            "configuration": {
                "minimumSetpoint": 18,
                "maximumSetpoint": 26,
                "tolerance": 1,
                "stepSize": 1
            }
        }],
        "sensors": []
    }],
    "services": [],
    "eventProcessors": [],
    "jobs": [],
    "groups": [],
    "data": []
};