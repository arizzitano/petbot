var socket = io.connect('http://petbot.herokuapp.com:8080');
socket.emit('event', {status: 'loaded'});
var keys = {
	37: {
		name: 'left',
		active: false,
		mode: 'steer'
	},
	38: {
		name: 'forward',
		active: false,
		mode: 'move'
	},
	39: {
		name: 'right',
		active: false,
		mode: 'steer'
	},
	40: {
		name: 'back',
		active: false,
		mode: 'move'
	}
};
$(document).ready(function() {
	var sendSignal = function(key, type) {
		var keyStatus = (type == 'keydown');
		if (key > 36 && key < 41 && (keys[key].active != keyStatus)) {
			// prevent simultaneous conflicting directions
			for (var i=37; i<41; i++) {
				if (i != key && keys[i].active && keys[i].mode == keys[key].mode) {
					return false;
				}
			}
			keys[key].active = keyStatus;
			socket.emit('direction', {
				name: keys[key].name,
				active: keys[key].active
			});
			if (keyStatus) {
				$('.direction').addClass(keys[key].name);
			} else {
				$('.direction').removeClass(keys[key].name);
			}
		}
	};
	
	$('body').on('keyup keydown', function(e) {
		sendSignal(e.which, e.type);
	});
});
