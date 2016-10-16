let _ = require('lodash'),
	entities = require('entities'),
	Service = require('../Service');

const PONY_API_URL = "https://derpibooru.org";
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Authority': 'https://derpibooru.org',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};
const MATCHING_WORS = ['pony', 'ponies', 'poney', 'cheval', 'horse'];

class Pony extends Service {

	constructor() {
		super('sendUrl');
	}

	matches(elem) {
		return elem.attribs
			&& elem.attribs.class
			&& _.split(elem.attribs.class, /\s+/).indexOf('image-show') !== -1;
	}

	hasData(data) {
		return data.length > 0
			&& data[0].attribs
			&& data[0].attribs['data-uris'];
	}

	resolveData(data) {
		var urls = entities.decodeHTML(data[0].attribs['data-uris']),
			urlJson = JSON.parse(urls);
		return `https:${urlJson.small}`;
	}

	getUrl() {
		return 'https://derpibooru.org/images/random';
	}

	getHeaders() {
		return HEADERS;
	}

	getMatchingWords() {
		return MATCHING_WORS;
	}


}

module.exports = Pony;
