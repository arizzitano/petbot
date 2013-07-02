var socket = io.connect('/', {
    transports: ['xhr-polling'],
    'reconnection delay': 100,
    'max reconnection attempts': 10000
});
socket.emit('clientId', {id: 'browser'});
var keys = {
    37: 'left',
    38: 'forward',
    39: 'right',
    40: 'backward'
};
socket.on('yourId', function (data) {
    T('browserId', data);
});
socket.on('localStatus', function (data) {
    T('localStatus', data);
});
socket.on('browsers', function (data) {
    T('browsers', JSON.stringify(data));
});
socket.on('bots', function (data) {
    T('bots', JSON.stringify(data));
});
socket.on('drive', function (data) {
    T('actualDrive', data);
});
socket.on('botOnline', function (data) {
    T('botOnline', data);
});
socket.on('connect', function () {
    T('online', true);
});
socket.on('reconnect', function () {
    T('online', true);
});
socket.on('disconnect', function () {
    T('online', false);
});

T('onlineStr', function () {
    return T('online') + '';
});
T('botOnlineStr', function () {
    return T('botOnline') + '';
});
T('status', function () {
    if (T('online')) {
        if (T('botOnline')) {
            return {
                name: 'online',
                message: 'Connected.'
            };
        } else {
            return {
                name: 'connecting',
                message: 'Connecting to petbot...'
            };
        }
    } else {
        return {
            name: 'offline',
            message: 'Connecting to server...'
        };
    }
});

socket.on('reloadui', function () {
    console.log('Reloading...')
    location.reload();
});
T('drive', function () {
    var forward = T('keys.forward');
    var backward = T('keys.backward');

    var right = T('keys.right');
    var left = T('keys.left');
    return {
        forward: forward ? 1 : backward ? -1 : 0,
        right: right ? 1 : left ? -1 : 0
    };
});
T('isDriving', function () {
    return !!T('drive.forward') || !!T('drive.right');
})
T(function () {
    if (T('isDriving')) {
        socket.emit('keepDriving');
        T('isDrivingTimer');
        setTimeout(function () {
            T.toggle('isDrivingTimer');
        }, 500);
    }
});
tbone.createView('topBanner', function () {
    this.$el.removeClass('online');
    this.$el.removeClass('connecting');
    this.$el.removeClass('offline');
    this.$el.addClass(T('status.name'));
});
tbone.createView('direction', function () {
    var $el = this.$el;
    var isOtherDriver = !!T('actualDrive.browserId') && T('browserId') !== T('actualDrive.browserId');
    $el.toggleClass('otherDriver', isOtherDriver);
    $el.toggleClass('left', T('actualDrive.right') === -1);
    $el.toggleClass('backward', T('actualDrive.forward') === -1);
    $el.toggleClass('right', T('actualDrive.right') === 1);
    $el.toggleClass('forward', T('actualDrive.forward') === 1);
});
T(function () {
    socket.emit('drive', T('drive') || {});
});
$(document).ready(function() {
    var sendSignal = function(key, type) {
        var isKeyDown = (type == 'keydown');
        // killswitch behavior for esc
        if (isKeyDown && key == 27) {
            T.unset('keys.left');
            T.unset('keys.backward');
            T.unset('keys.right');
            T.unset('keys.forward');
            // send an additional signal still?
        } else if (keys[key]) {
            var direction = keys[key];
            T('keys.' + direction, isKeyDown);
        }
    };

    $('body').on('keyup keydown', function(e) {
        sendSignal(e.which, e.type);
    });
    tbone.render($('[tbone]'));
});
