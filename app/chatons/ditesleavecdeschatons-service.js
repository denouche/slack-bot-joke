var iconv = require('iconv-lite'),
	_ = require('lodash'),
	Service = require('../service');

iconv.extendNodeEncodings();

const URL = 'http://ditesleavecdeschatons.tumblr.com/random';
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Host': 'ditesleavecdeschatons.tumblr.com',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};
const MATCHING_WORS = ['chaton', 'chatons'];

class Chatons extends Service {
	constructor() {
		super('sendUrl');
	}
	
    matches(elem) {
        return elem.type === "tag" && elem.name === 'img';
    }

    hasData(data) {
        return data.length > 0 && data[0].attribs.src;
    }

    resolveData(data) {
        return data[0].attribs.src;
    }

    getUrl() {
        return URL;
    }

    getHeaders() {
        return HEADERS;
    }

    getMatchingWords() {
        return MATCHING_WORS;
    }
}

module.exports = Chatons;
