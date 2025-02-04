var crypto = require('crypto'),
    hash = crypto.createHash,
    privateEncrypt = crypto.privateEncrypt,
    url = require('url');

// Create a base64 encoded SHA1 hash from a string
function sha1(str) {
    return hash('sha1').update(str).digest('base64');
}

// Hash the stringified body
function bodyHash(body) {
    return sha1(body ? body : '');
}

// Hash the path of the uri
function pathHash(uri) {
    return sha1(url.parse(uri).pathname);
}

// Generate a timestamp, formatted how Chef wants it
function timestamp() {
    return new Date().toISOString().slice(0, -5) + 'Z';
}

// Function used internally to build Chef authentication headers.
//
// Takes a client object and an options object. The client object must
// contain a user and key; it may also contain an API version string
//
// Returns an object that includes the required headers for
// authenticating with Chef.
module.exports = function authenticate(client, method, uri, body) {
    var bh = bodyHash(body),
        ph = pathHash(uri),
        ts = timestamp(),
        method = method,
        user = client.user,
        canonicalReq, headers;

    canonicalReq = 'Method:' + method + '\n' +
        'Hashed Path:' + ph + '\n' +
        'X-Ops-Content-Hash:' + bh + '\n' +
        'X-Ops-Timestamp:' + ts + '\n' +
        'X-Ops-UserId:' + user;

    headers = {
        'X-Chef-Version': client.version || '12.8.0',
        'X-Ops-Content-Hash': bh,
        'X-Ops-Sign': 'version=1.0',
        'X-Ops-Timestamp': ts,
        'X-Ops-UserId': user
    };

    privateEncrypt(client.key, Buffer.from(canonicalReq))
        .toString('base64')
        .match(/.{1,60}/g)
        .forEach(function (hash, line) {
            headers['X-Ops-Authorization-' + (line + 1)] = hash;
        });

    return headers;
};
