let htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q');

const PONY_API_URL = "https://derpibooru.org/";
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Host': 'https://derpibooru.org',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};

function getPonyPic() {
	return getRandomPonyId().then((id) => {
		return getPonyPicFromId(id);
	});
}

function getPonyPicFromId(id) {
	let deferred = q.defer();
	request({
		url: `${PONY_API_URL}/${id}`,
		method: 'GET',
		gzip: true,
		headers: HEADERS
	}, (error, response, body) => {
		console.info('response "derpibooru"', response.statusCode);
		if(!error && response.statusCode == 200) {
			let domUtils = require('htmlparser2').DomUtils;
			let handler = new htmlparser.DomHandler((err, dom) => {
				let phrase = domUtils.findAll((elem) => {
					if(elem.attribs && elem.attribs.id === 'image-display') {
						return true;
					}
					return false;
				}, dom);

				if(phrase.length > 0
					&& phrase[0].children.length > 0
					&& phrase[0].children[0].data) {
					deferred.resolve(phrase[0].children[0].data.trim());
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

function getRandomPonyId() {
	let deferred = q.defer();
	request({
	    url: `${PONY_API_URL}/search/index.json?q=safe%2Csolo&random_image=y`,
	    method: 'GET',
	    gzip: true
	}, (error, response) => {
		console.info('response "derpibooru"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	deferred.resolve(response.data);
	    }
	    else {
	    	deferred.reject();
	    }
	});
	return deferred.promise;
}

exports.get = getPonyPic;
