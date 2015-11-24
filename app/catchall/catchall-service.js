var q = require('q'),
    _ = require('lodash');

var imagesDict = {
        nope: [
            'http://36.media.tumblr.com/5062194390e83df1836bf8b9f0293ab9/tumblr_njzhnm2xa41qet9hvo1_250.png',
            'http://41.media.tumblr.com/5debdea0be796a07dc51cc5bc61bfe12/tumblr_njzhnm2xa41qet9hvo2_250.png',
            'http://41.media.tumblr.com/c034c2db8f6970c0bf7f0562b6d7bc91/tumblr_njzhnm2xa41qet9hvo3_250.png',
            'http://41.media.tumblr.com/45a6f06b8b2377ed61dc427cb98b2129/tumblr_njzhnm2xa41qet9hvo4_250.png'
        ]
    };

function getRandomItem(array) {
    return array[_.random(array.length - 1)];
}

function getImageForWord(word) {
	var deferred = q.defer();
    if(word && imagesDict[word]) {
        var item = getRandomItem(imagesDict[word]);
        deferred.resolve(item);
    }
    else {
        deferred.reject();
    }
	return deferred.promise;
}

exports.get = getImageForWord;

