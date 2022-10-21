# chef-node

[![NPM version](https://badge.fury.io/js/chef.png)](http://badge.fury.io/js/chef)
[![Build Status](https://travis-ci.org/sgentle/chef-node.png)](https://travis-ci.org/certara-jgitlin/chef-node)
[![Code Climate](https://codeclimate.com/github/sgentle/chef-node.png)](https://codeclimate.com/github/certara-jgitlin/chef-node)

A simple [Chef](http://www.opscode.com/chef/) client for Node.js. Handles the
authentication so you can get on with Cheffing.

Works with Cinc Server as well as Chef Server.

## Install

    npm install chef

## Changes in 1.0.0

Starting with major version 1.x, this module has been taken over by [Josh Gitlin](https://github.com/certara-jgitlin).

The code has been modernized which has a number of breaking changes: The old `request` module is no longer used,
and the Chef client **now uses Promises instead of callbacks**. That means that if you were on a `0.x` version
previously, you will need to re-write your code when moving to 1.0.0 or later.

Previously, `client.put`, `client.get`, etc took a callback as the final argument. Now, they return a promise
which you can chain on to with `client.get(...).then(function (result){ /* callback here */ })`

## Examples

Add role `bar` to node `foo`'s run list.

```javascript
var fs = require('fs'),
    chef = require('chef'),
    key = fs.readFileSync('/path/to/key.file.pem'),
    client = chef.createClient('username', key, 'http://chef.server.com:4000', '12.8.0');

client.get('/nodes/foo').then(node => {
    node.run_list.push('role[bar]');
    client.put('/nodes/foo', node).catch(err => {
        console.error(err);
    });
}).catch(err => { console.error(err); });
```

## Methods

The `client` object supports `delete`, `get`, `post` and `put` methods
and accepts relative and absolute URLs (so you can use URLs returned in
responses.) All methods return a Promise which resolves with the 
deserialized JSON from the Chef server.

The `client` object also supports the `req` method, which supports
passing an arbitrary HTTP verb and HTTP connection options. Unlike
the methods above, `req` returns an object containing the deserialized
JSON along with the actual `req` and `res` objects and associated
metadata (in case you need to access the HTTP status code or other
underlying properties)

## Self Signed Certs

If you need to connect to a chef server with a self signed cert, add the following to the .js file

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

## License

The MIT License (MIT)

Copyright (c) 2013 Sam Gentle, (c) 2022 Josh Gitlin

The term "Chef" is a trademark of Chef Software, Inc.
This project is not maintained by Progress/Chef.
Chef © 2010 - 2022 Chef Software, Inc. All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
