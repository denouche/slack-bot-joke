var htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q'),
	_ = require('lodash'),
	Service = require('../Service');

const URL = 'http://www.kaakook.fr/'
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Host': 'www.kaakook.fr',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};
const MATCHING_WORS = ['citation'];

class Citation extends Service {

	constructor() {
		super('sendMessage');
	}

	getResponse(url) {
		var deferred = q.defer();
		request({
			url: url || URL,
			method: 'GET',
			gzip: true,
			headers: HEADERS
		}, (error, response, body) => {
			console.info('response "kaakook"', response.statusCode);
			if (!error && response.statusCode == 200) {
				var domUtils = require('htmlparser2').DomUtils;
				var handler = new htmlparser.DomHandler((err, dom) => {
					var quote = domUtils.findAll((elem) => {
						if (elem.attribs && elem.attribs.class === 'corps') {
							return true;
						}
						return false;
					}, dom);
					var signature = domUtils.findAll((elem) => {
						if (elem.attribs && elem.attribs.class === 'signature') {
							return true;
						}
						return false;
					}, dom);

					var toSend = [];
					if (quote.length > 0
						&& quote[0].children.length > 0
						&& signature.length > 0
						&& signature[0].children.length > 2) {

						if (quote[0].children.length > 1 && quote[0].children[1].name === 'a') {
							// la citation est un lien, on va chercher le texte dans le lien
							toSend.push(quote[0].children[1].children[0].data.trim());
						}
						else {
							// on prend les childs en text
							_.filter(quote[0].children, function (e) {
								return e.type === 'text';
							});
							quote[0].children.forEach(function (e) {
								if (e.type === 'text') {
									toSend.push(e.data.trim());
								}
								else if (e.type === 'tag' && e.children.length > 0 && e.children[0].type === 'text') {
									toSend.push(e.children[0].data.trim());
								}
							});
						}
						toSend.push(signature[0].children[1].children[0].children[0].data.trim() + signature[0].children[2].data.trim());
						deferred.resolve(toSend);
					}
					else {
						deferred.reject();
					}
				});
				new htmlparser.Parser(handler).parseComplete(body);
			}
			else {
				deferred.reject();
			}
		});
		return deferred.promise;
	}

	getMatchingWords() {
		return MATCHING_WORS;
	}

	canManage(text) {
		return /^(citation|film)$/.test(text);
	}
}
module.exports = Citation;
