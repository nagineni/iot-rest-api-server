var child_process = require('child_process');

// Software Update tool
var swupd = "swupd ";

exports.verifyOS = function(repoURL, callback) {
  child_process.exec(swupd + "verify -u " + repoURL, callback);
}

exports.listBundles = function(callback) {
  child_process.exec(swupd + "bundle-add -l", callback);
}

exports.addBundle = function(bundleName, repoURL, callback) {
  child_process.exec(swupd + "bundle-add " + bundleName + " -u " + repoURL, callback);
}

exports.removeBundle = function(bundleName, callback) {
  child_process.exec(swupd + "bundle-remove " + bundleName, callback);
}

exports.updateOS = function(repoURL, callback) {
  child_process.exec(swupd + "update -u " + repoURL, callback);
}
