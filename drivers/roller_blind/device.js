'use strict';

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class RollerBlind extends ZigBeeDevice {

    onMeshInit() {
        this.registerCapability('measure_battery', 'genPowerCfg');

        this.registerCapabilityListener('windowcoverings_state', value => {
            return this._onWindowCoveringsStateSet(value);
        });
    }

    _onWindowCoveringsStateSet(state) {
        let action = this.mapWindowCoveringsStateToAction(state);

        return this.node.endpoints[this.getClusterEndpoint('closuresWindowCovering')].clusters.closuresWindowCovering
            .do(action, []).then(() => {
                return null;
            }, error => {
                this.log('error', error);
            });
    }

    mapWindowCoveringsStateToAction(state) {
        switch (state) {
            case 'up':
                return 'upOpen';
            case 'down':
                return 'downClose';
            case 'idle':
                return 'stop';
        }

        throw new Error(`Could not map window coverings state "${state}" to ZigBee action`);
    }

}

module.exports = RollerBlind;
