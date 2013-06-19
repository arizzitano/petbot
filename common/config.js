// misc settings
var DEBUG = true;

// host settings
var HOST_PRODUCTION  = 'http://petbot.herokuapp.com';
var HOST_DEVELOPMENT = 'http://localhost:5000';
var HOST             = DEBUG ? HOST_DEVELOPMENT : HOST_PRODUCTION;

module.exports.DEBUG = DEBUG;
module.exports.HOST  = HOST;
