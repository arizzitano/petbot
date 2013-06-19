// misc settings
var DEBUG  = true;

// host settings
var HOST_REMOTE = 'http://petbot.herokuapp.com';
var HOST_LOCAL  = 'http://localhost:5000';
var HOST        = DEBUG ? HOST_LOCAL : HOST_REMOTE;

module.exports.DEBUG = DEBUG;
module.exports.HOST  = HOST;
