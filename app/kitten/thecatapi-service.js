let _ = require('lodash'),
    Service = require('../service');

const URL = 'http://thecatapi.com/api/images/get?format=xml'
const HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'deflate, gzip',
    'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};
const MATCHING_WORS = ['chat', 'cat', 'kitten', 'god'];

class TheCatApi extends Service {

	constructor() {
		super('sendUrl');
	}

    matches(elem) {
        return elem.name === 'url';
    }

    hasData(data) {
        return data.length > 0 && data[0].children.length > 0;
    }

    resolveData(data) {
        return data[0].children[0].data;
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

module.exports = TheCatApi;