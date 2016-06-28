var SWUPD = require('../swupd/swupd');

const badRequestStatusCode = 400; // Bad request
const notFoundStatusCode = 404; // Not found

var routes = function(req, res) {
    if (req.path == '/verify') {
        handleVerifyOS(req, res);
    } else {
        if (req.method == "GET") {
            handleGetAvailableBundles(req, res);
        } else if (req.method == "PUT") {
            handleAddBundle(req, res);
        } else if (req.method == "POST") {
            handleUpdateOS(req, res);
        } else if (req.method == "DELETE") {
            handleRemoveBundle(req, res);
        } else {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'});
            res.end("Unsupported method: " + req.method);
        }
    }

    function handleVerifyOS(req, res) {
        console.log("%s %s", req.method, req.url);

        if (typeof req.query.url == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"url\" is missing.");
            return;
        }

        var callback = function(err, stdout, stderr) {
            if (err) {
                res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
                res.end(err.stack);
                return;
            }
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end(stdout);
        }
        SWUPD.verifyOS(req.query.url, callback);
    }

    function handleGetAvailableBundles(req, res) {
        console.log("%s %s", req.method, req.url);

        var callback = function(err, stdout, stderr) {
            if (err) {
                res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
                res.end(err.stack);
                return;
            }
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end(stdout);
        }
        SWUPD.listBundles(callback);
    }

    function handleAddBundle(req, res) {
        console.log("%s %s", req.method, req.url);

        if (typeof req.query.name == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"name\" is missing.");
            return;
        }

        if (typeof req.query.url == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"url\" is missing.");
            return;
        }

        var callback = function(err, stdout, stderr) {
            if (err) {
                res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
                res.end(err.stack);
                return;
            }
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end(stdout);
        }
        SWUPD.addBundle(req.query.name, req.query.url, callback);
    }

    function handleRemoveBundle(req, res) {
        console.log("%s %s", req.method, req.url);
        if (typeof req.query.name == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"name\" is missing.");
            return;
        }

        var callback = function(err, stdout, stderr) {
            if (err) {
                res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
                res.end(err.stack);
                return;
            }
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end(stdout);
        }
        SWUPD.removeBundle(req.query.name, callback);
    }

    function handleUpdateOS(req, res) {
        console.log("%s %s", req.method, req.url);
        if (typeof req.query.url == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"url\" is missing.");
            return;
        }

        var callback = function(err, stdout, stderr) {
            if (err) {
                res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
                res.end(err.stack);
                return;
            }
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end(stdout);
        }
        SWUPD.updateOS(req.query.url, callback);
    }
}

module.exports = routes;
