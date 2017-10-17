var google = require('google'),
    q = require('q'),
    _ = require('lodash'),
    Citation = require('../kaakook/kaakook-service.js'),
    util = require('util'),
    Service = require('../service');

google.resultsPerPage = 10;


const MATCHING_WORS = ['citationinverse'];

class CitationInverse extends Service {

    constructor() {
        super('sendMessage');
    }

    getResponse(citation) {
        return this.searchGoogle(citation)
            .then(function (url) {
                if (url) {
                    return new Citation().getResponse(url);
                }
                else {
                    return ["Désolé, je n'ai pas trouvé le film correspondant ..."];
                }
            });
    }

    searchGoogle(citation) {
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

    getMatchingWords() {
        return MATCHING_WORS;
    }

    canManage(text) {
        return /^(citation|film)\s.+$/.test(text);
    }
}

module.exports = CitationInverse;
