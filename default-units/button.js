module.exports = {
	metadata : {
		plugin : "button",
		label : "Button",
		role : "sensor",
		family : "button",
		deviceTypes : [ "microcontroller/microcontroller" ],
		configuration : [ {
			label : "Pin",
			id : "pin",
			type : {
				family : "reference",
				id : "digitalInOutPin"
			},
			defaultValue : "12"
		}, {
			label : "Holdtime",
			id : "holdtime",
			type : {
				id : "integer"
			},
			defaultValue : 500,
			unit : "ms"
		}, {
			label : "Send Click Events",
			id : "sendClickEvents",
			type : {
				id : "boolean"
			},
			defaultValue : true
		}, {
			label : "Send Down Events",
			id : "sendDownEvents",
			type : {
				id : "boolean"
			},
			defaultValue : false
		}, {
			label : "Send Down Events",
			id : "sendDownEvents",
			type : {
				id : "boolean"
			},
			defaultValue : false
		}, {
			label : "Send Hold Events",
			id : "sendHoldEvents",
			type : {
				id : "boolean"
			},
			defaultValue : false
		}, {
			label : "Holdtime",
			id : "holdtime",
			type : {
				id : "integer"
			},
			defaultValue : 500,
			unit : "ms"
		} ]
	},
	create : function() {
		return new Button();
	}
};

/**
 * 
 */
function Button() {
	/**
	 * 
	 */
	Button.prototype.start = function() {
		try {
			if (!this.isSimulated()) {
				var five = require("johnny-five");

				this.button = new five.Button(this.configuration.pin);

				var self = this;

				this.button.on("hold", function() {
					self.change("hold");
				});

				this.button.on("press", function() {
					self.change("press");
				});

				this.button.on("release", function() {
					self.change("release");
				});
			}
		} catch (x) {
			this.publishMessage("Cannot initialize " + this.device.id + "/"
					+ this.id + ":" + x);
		}
	};
};