var T = require('tbone').tbone;
var tbone = T;

module.exports = function (me) {
    T(function () {
        var drive = me('drive');
        me('pins.right', drive.right === 1 ? 5 : 0);
        me('pins.left', drive.right === -1 ? 5 : 0);
        me('pins.forward', drive.forward === 1 ? 5 : 0);
        me('pins.backward', drive.forward === -1 ? 5 : 0);
    });
    T(function () {
        me('pins.ready', !!me('awake'));
    });
};
