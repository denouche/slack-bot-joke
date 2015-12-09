var google = require('google'),
    q = require('q'),
    _ = require('lodash'),
    kaakook = require('../kaakook/kaakook-service.js');

google.resultsPerPage = 10;

function searchGoogle(citation) {
    var deferred = q.defer();
    google('site:kaakook.fr ' + citation, function (err, next, links) {
        if (err) {
            console.error(err);
            deferred.reject();
        }
        else {
            if(links.length === 0) {
                deferred.resolve();
            }
            else {
                var result =_.find(links, function(link) {
                    return /^http:\/\/www\.kaakook\.fr\/citation-.*/.test(link.link);
                });
                deferred.resolve(result.link);
            }
        }
    });
    return deferred.promise;
}

function findCitation(citation) {
    return searchGoogle(citation)
        .then(function(url) {
            if(url) {
                return kaakook.get(url);
            }
            else {
                return ["Désolé, je n'ai pas trouvé le film correspondant ..."];
            }
        });
}

exports.get = findCitation;
