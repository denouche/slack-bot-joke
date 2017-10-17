var q = require('q'),
    _ = require('lodash'),
    Service = require('../service');

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
        'ai', 'ais', 'aie', 'aies'
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
    ],
    yeux: [
        'eu', 'eux',
        'euh', 'heu',
        'eud', 'euds',
        'eut'
    ]
};

const MATCHING_WORS = ['poils'];

class Poils extends Service {

    constructor() {
        super('sendMessage');
    }

    getResponse(word) {
        console.log('getResponse', word);
        var deferred = q.defer(),
            textToTest = this.cleanWord(word);
        var foundKey = _.findKey(dict, function (elements) {
            return _.some(elements, function (e) {
                return _.endsWith(textToTest, e);
            })
        });
        if (foundKey) {
            deferred.resolve(_.castArray("Poils au " + foundKey));
        }
        else {
            deferred.reject();
        }
        return deferred.promise;
    }

    cleanWord(word) {
        return word.replace(/\s*[\?!\.]*$/, '');
    }

    getMatchingWords() {
        return MATCHING_WORS;
    }
}

module.exports = Poils;
