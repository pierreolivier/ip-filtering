var ipfiltering = require('./index');

// Initialize the ip filtering
var middleware = ipfiltering.middleware({});

// add some ips
ipfiltering.failure('127.0.0.1');
ipfiltering.failure('127.0.0.1');
ipfiltering.failure('127.0.0.1');
ipfiltering.failure('127.0.0.1');
ipfiltering.failure('127.0.0.1');
ipfiltering.failure('127.0.0.1');

// middleware function args
var req = {};
req.headers = {};
req.connection = {};
req.connection.remoteAddress = '127.0.0.1';
var res = {};
res.end = function (html) {
    console.log('status code : ' + res.statusCode);
    console.log(html);
};
var next = function() {};

// execute the ip filtering
middleware(req, res, next);