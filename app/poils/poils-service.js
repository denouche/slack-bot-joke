var q = require('q'),
    _ = require('lodash');

var dict = {
    dos: [
        'eau', 'eaux',
        'au', 'aux',
        'o', 'os',
        'ot',
        'aut'
    ],
    dents: [
        'ent', 'ents',
        'ant', 'ants',
        'an', 'ans'
    ],
    nez: [
        'é', 'és', 'ées',
        'et',
        'er',
        'ait', 'aient',
        'ai', 'ais', 'aies'
    ],
    aisselles: [
        'elles',
        'elle',
        'el',
        'els'
    ],
    fesses: [
        'esse',
        'esses'
    ],
    bras: [
        'à', 'a', 'as',
        'at', 'ats',
        'oi', 'ois',
        'ah', 'ha'
    ],
    front: [
        'on', 'ons',
        'ont', 'onts'
    ],
    cou: [
        'oup', 'oups',
        'out', 'outs',
        'ou', 'ous'
    ],
    mains: [
        'in', 'ins',
        'int', 'ints'
    ]
};

function cleanWord(word) {
    return word.replace(/\s*[\?!\.]*$/, '');
}

function getResponse(word) {
    var deferred = q.defer(),
        textToTest = cleanWord(word);
    var foundKey = _.findKey(dict, function(elements) {
        return _.some(elements, function(e) {
            return _.endsWith(textToTest, e);
        })
    });
    if(foundKey) {
        deferred.resolve("Poils au " + foundKey);
    }
    else {
        deferred.reject();
    }
    return deferred.promise;
}

exports.getResponse = getResponse;
