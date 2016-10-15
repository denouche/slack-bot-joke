var q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

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

let self;

let Poils = function () {
    self = this;
    this.on('poils', (channel, input) => {
        getResponse(input).then(function (message) {
            self.emit('sendMessage', message, channel);
        });
    });
};

util.inherits(Poils, EventEmitter);

function getResponse(word) {
    var deferred = q.defer(),
        textToTest = cleanWord(word);
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

function cleanWord(word) {
    return word.replace(/\s*[\?!\.]*$/, '');
}

module.exports = Poils;
