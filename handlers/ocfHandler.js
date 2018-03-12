var OIC = require('../oic/oic');
var device = require('iotivity-node');

const RESOURCE_FOUND_EVENT = "resourcefound";
const RESOURCE_DELETE_EVENT = "delete";
const RESOURCE_ERROR_EVENT = "error";
const DEVICE_FOUND_EVENT = "devicefound";
const PLATFORM_FOUND_EVENT = "platformfound";

const timeoutValue = 5000; // 5s
const timeoutStatusCode = 504; // Gateway Timeout
const socketTimeoutValue = 0; // No timeout

const okStatusCode = 200; // All right
const noContentStatusCode = 204; // No content
const internalErrorStatusCode = 500; // Internal error
const badRequestStatusCode = 400; // Bad request
const notFoundStatusCode = 404; // Not found

device.device = Object.assign(device.device, {
    name: 'IoT REST API Server',
    coreSpecVersion: 'ocf.1.1.0',
    dataModels: ["ocf.res.1.1.0", "ocf.sh.1.1.0"]
});

device.platform = Object.assign(device.platform, {
    manufacturerName: 'Intel',
    manufactureDate: new Date('Tue Sep 19 14:41:28 (EET) 2017'),
    platformVersion: '1.1.0'
});

var DEV = device.client;

// Error handler
function errorHandler(error) {
    console.log("OCF server responded with error", error.message);
}

DEV.on("error", errorHandler);

var routes = function(req, res) {
    var discoveredResources = [];
    var discoveredDevices = [];
    var discoveredPlatforms = [];
    var index;

    if (req.path == '/res')
        discoverResources(req, res);
    else if (req.path == '/d')
        discoverDevices(req, res);
    else if (req.path == '/p')
        discoverPlatforms(req, res);
    else {
        if (req.method == "GET")
            handleResourceGet(req, res);
        else if (req.method == "POST")
            handleResourcePost(req, res);
        else {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'});
            res.end("Unsupported method: " + req.method);
        }
    }

    function onResourceFound(resourceInfo) {
        var resource = OIC.parseRes(resourceInfo);
        // Do not add resource to the list, if we have already seen it.
        for (index in discoveredResources) {
             if (JSON.stringify(resource) ===
                 JSON.stringify(discoveredResources[index]))
                 return;
        }
        discoveredResources.push(resource);
    }

    function onDeviceFound(deviceInfo) {
        // Do not add device to the list, if we have already seen it.
        for (index in discoveredDevices) {
             if (deviceInfo.uuid === discoveredDevices[index].di)
                 return;
        }
        var device = OIC.parseDevice(deviceInfo);
        discoveredDevices.push(device);
    }

    function onPlatformFound(platformInfo) {
        var platform = OIC.parsePlatform(platformInfo);
        discoveredPlatforms.push(platform);
    }

    function notSupported(req, res) {
        res.writeHead(internalErrorStatusCode, {'Content-Type':'text/plain'})
        res.end("Not supported operation: " + req.method + " " + req.path);
    }

    function discoverResources(req, res) {
        console.log("discoverResources");
        res.setTimeout(timeoutValue, function() {
            DEV.removeListener(RESOURCE_FOUND_EVENT, onResourceFound);
            res.writeHead(okStatusCode, 'Content-Type', 'application/json');
            res.end(JSON.stringify(discoveredResources));
        });

        res.on('close', function() {
            console.log("Client: close");
            DEV.removeListener(RESOURCE_FOUND_EVENT, onResourceFound);
        });

        console.log("%s %s", req.method, req.url);

        discoveredResources.length = 0;
        DEV.on(RESOURCE_FOUND_EVENT, onResourceFound);

        var options = {};
        if (typeof req.query.di != "undefined")
            options.deviceId = req.query.di;

        if (typeof req.query.rt != "undefined")
            options.resourceType = req.query.rt;

        console.log("Discovering resources for %d seconds.", timeoutValue/1000);
        DEV.findResources(options).then(function() {
            // TODO: should we send in-progress back to http-client
            console.log("findResources() successful");
        })
        .catch(function(e) {
            res.writeHead(internalErrorStatusCode, {'Content-Type':'text/plain'})
            res.end("Error: " + e.message);
        });
    }

    function discoverDevices(req, res) {
        res.setTimeout(timeoutValue, function() {
            DEV.removeListener(DEVICE_FOUND_EVENT, onDeviceFound);
            res.writeHead(okStatusCode, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(discoveredDevices));
        });

        res.on('close', function() {
            console.log("Client: close");
            DEV.removeListener(DEVICE_FOUND_EVENT, onDeviceFound);
        });

        console.log("%s %s", req.method, req.url);

        discoveredDevices.length = 0;
        DEV.on(DEVICE_FOUND_EVENT, onDeviceFound);

        console.log("Discovering devices for %d seconds.", timeoutValue/1000);
        DEV.findDevices().then(function() {
            // TODO: should we send in-progress back to http-client
            console.log("findDevices() successful");
        })
        .catch(function(e) {
            res.writeHead(internalErrorStatusCode, {'Content-Type':'text/plain'})
            res.end("Error: " + e.message);
        });
    }

    function discoverPlatforms(req, res) {
        res.setTimeout(timeoutValue, function() {
            DEV.removeListener(PLATFORM_FOUND_EVENT, onPlatformFound);
            res.writeHead(okStatusCode, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(discoveredPlatforms));
        });

        res.on('close', function() {
            console.log("Client: close");
            DEV.removeListener(PLATFORM_FOUND_EVENT, onPlatformFound);
        });

        console.log("%s %s", req.method, req.url);

        discoveredPlatforms.length = 0;
        DEV.on(PLATFORM_FOUND_EVENT, onPlatformFound);

        console.log("Discovering platforms for %d seconds.", timeoutValue/1000);
        DEV.findPlatforms().then(function() {
            console.log("findPlatforms() successful");
        })
        .catch(function(e) {
            res.writeHead(internalErrorStatusCode, {'Content-Type':'text/plain'})
            res.end("Error: " + e.message);
        });
    }

    function handleResourceGet(req, res) {
        if (typeof req.query.di == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"di\" is missing.");
            return;
        }
        console.log("%s %s (fd: %d)", req.method, req.url, req.socket._handle.fd);

        function observer(resource) {
            var fd = (res.socket._handle == null) ? -1 : res.socket._handle.fd;
            console.log("obs: %d, fin: %s, di: %s, fd: %d",req.query.obs, res.finished, req.query.di, fd);
            if (req.query.obs == true && res.finished == false) {
                var json = OIC.parseResource(resource);
                res.write(json);
            } else {
                DEV.retrieve(resource, observer, true);
                resource.removeListener(RESOURCE_DELETE_EVENT, deleteHandler);
                resource.removeListener(RESOURCE_ERROR_EVENT, errorHandler);
            }
        }

        function deleteHandler(resource) {
            console.log("Resource %s has been deleted", req.url);
            if (req.query.obs == true && res.finished == false) {
                res.end();
            }
        }

        var ep = {};
        if (typeof req.query.ep != "undefined")
            ep.origin = req.query.ep;

        if (typeof req.query.pri != "undefined")
            ep.priority = parseInt(req.query.pri);

        DEV.retrieve({deviceId: req.query.di, resourcePath: req.path, endpoint: ep}, req.query).then(
            function(resource) {
                if (req.query.obs != "undefined" && req.query.obs == true) {
                    req.on('close', function() {
                        console.log("Client: close");
                        DEV.retrieve(resource, observer, true);
                        resource.removeListener(RESOURCE_DELETE_EVENT, deleteHandler);
                        resource.removeListener(RESOURCE_ERROR_EVENT, errorHandler);
                        req.query.obs = false;
                    });
                    res.writeHead(okStatusCode, {'Content-Type':'application/json'});
                    req.setTimeout(socketTimeoutValue);
                    DEV.retrieve(resource, observer);
                    resource.on(RESOURCE_DELETE_EVENT, deleteHandler);
                    resource.on(RESOURCE_ERROR_EVENT, errorHandler);
                } else {
                    var json = OIC.parseResource(resource);
                    res.writeHead(okStatusCode, {'Content-Type':'application/json'});
                    res.end(json);
                }
            },
            function(error) {
                res.writeHead(notFoundStatusCode, {'Content-Type':'text/plain'})
                res.end("Resource retrieve failed: " + error.message);
            }
        );
    }

    function handleResourcePost(req, res) {
        if (typeof req.query.di == "undefined") {
            res.writeHead(badRequestStatusCode, {'Content-Type':'text/plain'})
            res.end("Query parameter \"di\" is missing.");
            return;
        }

        res.setTimeout(timeoutValue, function() {
            res.writeHead(notFoundStatusCode, {'Content-Type':'text/plain'})
            res.end("Resource not found.");
        });

        var body = [];
        req.on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            body = Buffer.concat(body).toString();
            var ep = {};
            if (typeof req.query.ep != "undefined")
                ep.origin = req.query.ep;

            if (typeof req.query.pri != "undefined")
                ep.priority = parseInt(req.query.pri);

            var resource = {
                deviceId: req.query.di,
                resourcePath: req.path,
                properties: JSON.parse(body),
                endpoint: ep
            };
            console.log("POST %s: %s", req.originalUrl, JSON.stringify(resource));
            DEV.update(resource).then(
                function() {
                    res.statusCode = noContentStatusCode;
                    res.end();
                },
                function(error) {
                    res.writeHead(notFoundStatusCode, {'Content-Type':'text/plain'})
                    res.end("Resource update failed: " + error.message);
                }
            );
        });
    }
}
module.exports = routes;
