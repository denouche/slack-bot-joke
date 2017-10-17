var _ = require('lodash'),
	Service = require('../service');

const URL = 'http://www.excusesdedev.com/';
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Host': 'www.excusesdedev.com',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};
const MATCHING_WORS = ['excuse', 'dev'];

class ExcusesDeDev extends Service {

	constructor() {
		super('sendMessage');
	}

	matches(elem) {
		return elem.attribs && elem.attribs.class === 'quote';
	}

	hasData(data) {
		return data.length > 0
			&& data[0].children.length > 0
			&& data[0].children[0].data;
	}

	resolveData(data) {
		return _.castArray(data[0].children[0].data.trim());
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
module.exports = ExcusesDeDev;
