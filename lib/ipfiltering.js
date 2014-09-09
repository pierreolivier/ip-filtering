_clients = {};

/**
 * Test if n is an integer
 *
 * @param n
 * @return boolean is an integer *
 */
function isInt(n) {
    return n % 1 === 0;
}

/**
 * Initialize the ip filtering
 *
 * Arguments :
 *  - maxFailure = 5
 *  - banTime = 300 (seconds)
 *  - errorCode = 401
 *  - errorMessage = 'Unauthorized'
 *
 * @param {object} args
 * @return Function middleware function
 *
 */
module.exports.middleware = function (args) {
    if (typeof args != "object") {
        args = {maxFailure: 5, banTime: 300, errorCode: 401, errorMessage: 'Unauthorized'};
    } else {
        if (!isInt(args.maxFailure)) {
            args.maxFailure = 5;
        }
        if (!isInt(args.banTime)) {
            args.banTime = 300;
        }
        if (!isInt(args.errorCode)) {
            args.errorCode = 401;
        }
        if (typeof args.errorMessage != "string") {
            args.errorMessage = 'Unauthorized';
        }
    }

    return function (req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        var client = _clients[ip];
        if (client != undefined) {
            var timestamp = Date.now();

            if (client.failures > args.maxFailure) {
                if (client.ban == 0) {
                    client.ban = timestamp + args.banTime * 1000;
                }

                if (client.ban < timestamp) {
                    delete _clients[ip];
                } else {
                    client.ban = timestamp + args.banTime * 1000;

                    res.statusCode = args.errorCode;
                    return res.end(args.errorMessage);
                }
            }
        }

        return next();
    }
};

/**
 * Add a new failure for the specified ip
 *
 * @param {string} ip or {object} req
 */
module.exports.failure = function (ip) {
    var ipString = '';

    if (typeof ip == "string") {
        ipString = ip;
    } else if (typeof ip == "object") {
        try {
            ipString = ip.headers['x-forwarded-for'] || ip.connection.remoteAddress || ip.socket.remoteAddress || ip.connection.socket.remoteAddress;
        } catch (e) {
            console.error(e.stack);
            return false;
        }

    }

    if (ipString == '') {
        return false;
    }

    var client = _clients[ipString];
    if (client != undefined) {
        client.failures++;
    } else {
        client = {failures: 1, ban: 0};

        _clients[ipString] = client;
    }

    return true;
};