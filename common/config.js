// misc settings
var DEBUG = true;

// host settings
var HOST_PRODUCTION  = 'http://petbot.herokuapp.com';
var HOST_DEVELOPMENT = 'http://localhost:5000';
var HOST             = DEBUG ? HOST_DEVELOPMENT : HOST_PRODUCTION;

// special client ids
var DEVICE_ID = 'dGhlIHJvYm90IHJldm9sdXRpb24gd2lsbCBub3QgYmUgdGVsZXZpc2Vk';

module.exports.DEBUG = DEBUG;
module.exports.HOST  = HOST;
module.exports.DEVICE_ID = DEVICE_ID;
