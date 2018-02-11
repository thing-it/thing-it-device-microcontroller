module.exports = {
    metadata: {
        plugin: "airQuality",
        label: "Air Quality",
        role: "sensor",
        family: "airQuality",
        deviceTypes: ["microcontroller/microcontroller"],
        events: [{
            id: "motionDetected",
            label: "AirQuality detected"
        }, {
            id: "noMoreMotion",
            label: "No more AirQuality"
        }],
        state: [{
            id: "eCo2",
            label: "eCo2",
            type: {
                id: "integer"
            }
        }, {
            id: "voc",
            label: "VOC",
            type: {
                id: "integer"
            }
        }],
        configuration: [{
            label: "Controller",
            id: "controller",
            type: {
                family: "enumeration",
                values: [{
                    label: "CCS811  (I2C)",
                    id: "CCS811"
                }]
            }
        }]
    },
    create: function () {
        return new AirQuality();
    }
};

/**
 *
 */
function AirQuality() {
    /**
     *
     */
    AirQuality.prototype.start = function () {

        this.logLevel = 'debug';

        try {
            if (!this.isSimulated()) {

                try {

                    //console.log(this.device.board);

                    this.state = {
                        motion: false,
                        ticks: 0
                    };
                    console.log("hier");


                    const CCS811_ADDRESS = 0x5A;

                    const CCS811_STATUS = 0x00;
                    const CCS811_MEAS_MODE = 0x01;
                    const CCS811_ALG_RESULT_DATA = 0x02;
                    const CCS811_RAW_DATA = 0x03;
                    const CCS811_ENV_DATA = 0x05;
                    const CCS811_NTC = 0x06;
                    const CCS811_THRESHOLDS = 0x10;
                    const CCS811_BASELINE = 0x11;
                    const CCS811_HW_ID = 0x20;
                    const CCS811_HW_VERSION = 0x21;
                    const CCS811_FW_BOOT_VERSION = 0x23;
                    const CCS811_FW_APP_VERSION = 0x24;
                    const CCS811_ERROR_ID = 0xE0;
                    const CCS811_SW_RESET = 0xFF;

                    const CCS811_BOOTLOADER_APP_ERASE = 0xF1;
                    const CCS811_BOOTLOADER_APP_DATA = 0xF2;
                    const CCS811_BOOTLOADER_APP_VERIFY = 0xF3;
                    const CCS811_BOOTLOADER_APP_START = 0xF4;

                    const CCS811_DRIVE_MODE_IDLE = 0x00;
                    const CCS811_DRIVE_MODE_1SEC = 0x01;
                    const CCS811_DRIVE_MODE_10SEC = 0x02;
                    const CCS811_DRIVE_MODE_60SEC = 0x03;
                    const CCS811_DRIVE_MODE_250MS = 0x04;

                    const CCS811_HW_ID_CODE = 0x81;
                    const CCS811_REF_RESISTOR = 100000;

                    console.log("starte req");


                    //var tmp = this.device.board.io.i2c.readByteSync(CCS811_ADDRESS, CCS811_MEAS_MODE, 0x01);

                    this.device.board.i2cConfig({
                        address: CCS811_ADDRESS
                    });
                    // this.device.board.i2cRead(CCS811_ADDRESS, CCS811_MEAS_MODE, 2, function(bytes) {
                    //     console.log("Bytes read: ", bytes);
                    // });
                    // this.device.board.i2cWriteReg(CCS811_ADDRESS, CCS811_MEAS_MODE, 0x08);

                    //  //to application mode
                    // this.device.board.i2cWrite(0x5A, 0x01, [0x10]);
                    //
                    //  this.device.board.i2cConfig({
                    //      address: CCS811_ADDRESS
                    //  });

                    // setTimeout(function () {
                    //     this.device.board.i2cReadOnce(CCS811_ADDRESS, 0x01, 1, function (bytes) {
                    //         //var tmp = bytes.toString(16);
                    //         let json = JSON.stringify(bytes);
                    //
                    //         console.log(json);
                    //         console.log("Done!");
                    //     });
                    // }.bind(this), 5000);


                    setInterval(function () {
                        this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_ALG_RESULT_DATA, 8, function (bytes) {
                            //var tmp = bytes.toString(16);
                            let json = JSON.stringify(bytes);

                            let eco2 = (bytes[0] << 8) | (bytes[1]);
                            let tvoc = (bytes[2] << 8) | (bytes[3]);

                            console.log(json);
                            this.logDebug("eCO2: " + eco2 + "   TVOC: " + tvoc);

                        }.bind(this));
                    }.bind(this), 3000);

                    // setInterval(function () {
                    //     this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_ERROR_ID, 1, function (bytes) {
                    //         //var tmp = bytes.toString(16);
                    //         let json = JSON.stringify(bytes);
                    //
                    //         console.log(json);
                    //         console.log("Done!");
                    //     });
                    // }.bind(this), 1000);
                    //
                    // this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_HW_ID, 1, function (bytes) {
                    //     var tmp = bytes.toString(16);
                    //     console.log("Bytes read: ", tmp);
                    //     console.log("Done!");
                    // });
                    // this.device.board.i2cConfig({
                    //     address: CCS811_ADDRESS
                    // });
                    // this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_ALG_RESULT_DATA, 8, function (bytes) {
                    //     //var tmp = bytes.toString(16);
                    //     console.log("Bytes read: ", bytes);
                    //     console.log("Done!");
                    // });
                    // this.device.board.i2cConfig({
                    //     address: CCS811_ADDRESS
                    // });
                    // this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_STATUS, 1, function (bytes) {
                    //     //var tmp = bytes.toString(16);
                    //     console.log("Bytes read: ", bytes);
                    //     console.log("Done!");
                    // });


                    //console.log(tmp);

                    // this.device.board.i2cReadOnce(CCS811_ADDRESS, CCS811_MEAS_MODE, 8, function (buf) {
                    //
                    //
                    //     var eCO2 = (buf[0] << 8) | (buf[1]);
                    //     var tVOC = (buf[2] << 8) | (buf[3]);
                    //
                    //     console.log("eCo2 ", eCO2);
                    //     console.log("tvoc ", tVOC);
                    //
                    //
                    // });
                    //
                    // this.device.board.i2cRead(CCS811_ADDRESS, CCS811_ALG_RESULT_DATA, 8, function (buf) {
                    //
                    //
                    //     var eCO2 = (buf[0] << 8) | (buf[1]);
                    //     var tVOC = (buf[2] << 8) | (buf[3]);
                    //
                    //     console.log("eCo2 ", eCO2);
                    //     console.log("tvoc ", tVOC);
                    //
                    //
                    // });

                    console.log("hier auch");


                } catch (x) {

                    console.log(x);
                }


            }
        } catch (x) {
            this.publishMessage("Cannot initialize " + this.device.id + "/"
                + this.id + ":" + x);
        }
    };


    AirQuality.prototype.getState = function () {
        return this.state;
    };
};