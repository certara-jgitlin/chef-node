const authenticate = require('./chef/authenticate'),
      url = require('url'),
      https = require('https');

const methods = ['delete', 'get', 'post', 'put'];

/**
 * Constructor function for a new Chef client
 * 
 * the `key` parameter may be either a string containing the PEM encoded
 * private key of the user to authenticate with, or an object with two
 * keys: `key` mapping to the PEM encoded key and `passphrase` mapping
 * to the passphrase for a password-protected key.
 * 
 * @param {string} user - the Chef server username to authenticate as
 * @param {string|object} key - the PEM encoded text or object with of the user's key and password
 * @param {object} [options] - object containing API version and timeout
 */
function Chef(user, key, options) {
    this.user = user;
    this.key = (typeof key == "object") ? key : {
        key: key
    };

    options = options || {};
    options.version = options.version || '12.8.0';
    options.timeout = options.timeout || 30000;
    this.options = options;
    this.version = options.version;
}

function req(method, uri, body, opts) {
    // Add the base property of the client if the request does not specify the
    // full URL.
    if (this.options.base && this.options.base.length && uri.substr(0, this.options.base.length) != this.options.base) {
        uri = this.options.base + uri;
    }

    let my_url = url.parse(uri);

    opts = Object.assign(opts || {}, {
        headers: {},
        method: method.toUpperCase(),
        path: my_url.path,
        host: my_url.hostname,
        port: my_url.port
    });

    if (body) {
        body = JSON.stringify(body) + "\r\n";
        opts.headers["Content-Type"] = "application/json";
        opts.headers["Content-Length"] = Buffer.byteLength(body);
    } else {
        body = "";
    }

    opts.headers = Object.assign(opts.headers, authenticate(this, opts.method, uri, body));

    return new Promise((resolve, reject) => {
        let response_body = "";
        let client = https.request(opts, (res) => {
            try {              
                res.on('data', (d) => {
                    response_body += d;
                });
                
                res.on('end', () => {
                    try {
                        let result = response_body;
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            if (res.headers["content-type"] === 'application/json') {
                                result = JSON.parse(response_body);
                            }
                            resolve({
                                data: result,
                                body: response_body,
                                url: my_url,
                                requst: client,
                                response: res
                            });
                        }
                        else {
                            console.warn(`FAIL: ${my_url.href} HTTP ${res.statusCode}`);
                            reject(new Error("HTTP Result Code not OK"), response_body, res);
                        }
                    } catch (err) {
                        console.error(`Error caught inside response end closure: ${err}`);
                        reject(err, response_body, res);
                    }
                });
            }
            catch (ex) {
                console.error("ERROR in https request", ex);
                reject(ex);
            }
        });
        client.on('error', (e) => {
            console.error(`Failed to make request to ${my_url.href} -- ${e}`);
            reject(e);
        });
        if (body && body.length) {
            client.write(body);
        }
        client.end();
    });
}

Chef.prototype.request = function request(method, uri, body, opts) {
    return req.call(this, method, uri, body, opts);
}

methods.forEach(function (method) {
    Chef.prototype[method] = function (uri, body, opts) {
        return req.call(this, method, uri, body, opts).then((result) => {
            return result.data;
        });
    };
});

exports.createClient = function (user, key, options) {
    return new Chef(user, key, options);
};
