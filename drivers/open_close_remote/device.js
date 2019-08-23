'use strict';

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class ControlOutlet extends ZigBeeDevice {
	onMeshInit() {
		this.open = false;

		// Register onoff capability
		this.registerCapability('onoff', 'genOnOff');

		// Register report listeners
		this.registerReportListener('genOnOff', 'on', this.onCommandParser.bind(this));
		this.registerReportListener('genOnOff', 'off', this.offCommandParser.bind(this));
		this.registerReportListener('genOnOff', 'toggle', this.toggleCommandParser.bind(this));
		this.registerReportListener('genOnOff', 'offWithEffect', payload => {
			this.log('received offWithEffect', payload);
		});

		// Register remote_open Flow Card Device Trigger
		this.remoteOpenTriggerDevice = new Homey.FlowCardTriggerDevice('remote_open');
		this.remoteOpenTriggerDevice.register();

		// Create throttled function for trigger Flow
		this.triggerOpenFlow = this.throttle(() => {
			return this.remoteOpenTriggerDevice.trigger(this)
				.catch(err => this.error('Error triggering remote_open', err));
		}, 100);

		// Register remote_open Flow Card Device Trigger
		this.remoteCloseTriggerDevice = new Homey.FlowCardTriggerDevice('remote_close');
		this.remoteCloseTriggerDevice.register();

		// Create throttled function for trigger Flow
		this.triggerCloseFlow = this.throttle(() => {
			return this.remoteCloseTriggerDevice.trigger(this)
				.catch(err => this.error('Error triggering remote_close', err));
		}, 100);
	}

	onCommandParser() {
		this.open = true;
		this.triggerOpenFlow();
	}

	offCommandParser() {
		this.open = false;
		this.triggerCloseFlow();
	}

	toggleCommandParser() {
		this.open = !this.open;

		if (this.open) {
			this.triggerOpenFlow();
		} else {
			this.triggerCloseFlow();
		}
	}
}

module.exports = ControlOutlet;