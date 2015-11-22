var q = require('q');

function getMock() {
    var deferred = q.defer();
    deferred.reject();
    return deferred.promise;
}

exports.getJoke = getMock;
exports.getSavoirInutile = getMock;
exports.getExcuse = getMock;
exports.getCitation = getMock;
exports.getLink = getMock;
exports.getSavoirInutile = getMock;
