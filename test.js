var ipfiltering = require('./index');

function generateFailures(ip, n) {
    for (var i = 0 ; i < n ; i++) {
        ipfiltering.failure(ip);
    }
}

function generateReq(ip) {
    var req = {};

    req.headers = {};
    req.connection = {};
    req.connection.remoteAddress = ip;

    return req;
}

function generateRes() {
    var res = {};

    res.end = function (html) {
        console.log('statusCode : ' + res.statusCode);
        console.log('html : ' + html);
        console.log('------------');
    };

    return res;
}

function generateNext() {
    var next = function() {
        console.log('next');
        console.log('------------');
    };

    return next;
}

// Initialize the ip filtering
var middleware = ipfiltering.middleware({banTime: 10});

// add some ips
generateFailures('127.0.0.1', 6);

// middleware function args
var req = generateReq('127.0.0.1');
var res = generateRes();
var next = generateNext();

// execute the ip filtering
middleware(req, res, next);

setTimeout(function() {
    middleware(req, res, next);
}, 4000);

setTimeout(function() {
    middleware(req, res, next);
}, 11000);