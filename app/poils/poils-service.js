var q = require('q'),
    _ = require('lodash');

var dict = {
    dos: [
        'eau',
        'eaux',
        'au',
        'aux',
        'o',
        'ot',
        'os',
        'aut'
    ],
    dents: [
        'ent',
        'ents',
        'ant',
        'ants',
        'an',
        'ans'
    ],
    nez: [
        'é',
        'és',
        'ées',
        'et',
        'er'
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
        'a',
        'as',
        'at',
        'ats'
    ],
    front: [
        'on',
        'ont',
        'ons',
        'onts'
    ],
    cou: [
        'oup',
        'oups',
        'out',
        'outs',
        'ou',
        'ous'
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
