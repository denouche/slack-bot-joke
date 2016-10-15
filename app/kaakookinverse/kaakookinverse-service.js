var google = require('google'),
    q = require('q'),
    _ = require('lodash'),
    kaakook = require('../kaakook/kaakook-service.js'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

google.resultsPerPage = 10;


const MATCHING_WORS = ['citationinverse'];

let self;

let CitationInverse = function () {
    self = this;
    _.forEach(MATCHING_WORS, (word) => {
        this.on(word, (channel, config) => {
            manageNotification(channel, config);
        });
    });
};

util.inherits(CitationInverse, EventEmitter);

function manageNotification(channel, config) {
    return getResponse(config).then((message) => {
        self.emit('sendMessage', message, channel);
    });
}

function getResponse(citation) {
    return searchGoogle(citation)
        .then(function (url) {
            if (url) {
                return kaakook.get(url);
            }
            else {
                return ["Désolé, je n'ai pas trouvé le film correspondant ..."];
            }
        });
}

function searchGoogle(citation) {
    var deferred = q.defer();
    google('site:kaakook.fr ' + citation, function (err, next, links) {
        if (err) {
            console.error(err);
            deferred.reject();
        }
        else {
            if (links.length === 0) {
                deferred.resolve();
            }
            else {
                var result = _.find(links, function (link) {
                    return /^http:\/\/www\.kaakook\.fr\/citation-.*/.test(link.link);
                });
                if (result) {
                    deferred.resolve(result.link);
                }
                else {
                    deferred.resolve();
                }
            }
        }
    });
    return deferred.promise;
}

module.exports = CitationInverse;
