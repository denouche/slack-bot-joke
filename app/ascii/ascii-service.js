var art = require('ascii-art'),
    q = require('q');

function getAscii(word) {
    var deferred = q.defer(),
        toConvert = word.replace(/\s/g, '   ');

    art.font(toConvert, 'Doom', function(rendered) {
        deferred.resolve(rendered);
    });
    return deferred.promise;
}

exports.getAscii = getAscii;

