_clients = {};

/**
 * Test if n is an integer
 *
 * @param n
 * @return boolean is an integer *
 */
function _isInt(n) {
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
        if (!_isInt(args.maxFailure)) {
            args.maxFailure = 5;
        }
        if (!_isInt(args.banTime)) {
            args.banTime = 300;
        }
        if (!_isInt(args.errorCode)) {
            args.errorCode = 401;
        }
        if (typeof args.errorMessage != "string") {
            args.errorMessage = 'Unauthorized';
        }
    }

    return function (req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        var client = _clients[ip];
        if (client != undefined) {
            var timestamp = Date.now();

            if (client.failures > args.maxFailure) {
                if (client.ban == 0) {
                    client.ban = timestamp + args.banTime * 1000;
                }

                if (client.ban < timestamp) {
                    client.failures = 0;
                    client.ban = 0;
                } else {
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
 * @param {string} ip
 */
module.exports.failure = function (ip) {
    var client = _clients[ip];
    if (client != undefined) {
        client.failures++;
    } else {
        client = {failures: 1, ban: 0};

        _clients[ip] = client;
    }
};