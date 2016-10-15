let htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q'),
	_ = require('lodash'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

const URL = 'http://www.savoir-inutile.com/';
const HEADERS = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'deflate, gzip',
	'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	'Cache-Control': 'no-cache',
	'Connection': 'keep-alive',
	'Host': 'www.savoir-inutile.com',
	'Pragma': 'no-cache',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};

let self;

let SavoirInutile = function () {
	self = this;
	this.on('savoir', (channel) => {
		manageNotification(channel);
	});
	this.on('inutile', (channel) => {
		manageNotification(channel);
	});
};

util.inherits(SavoirInutile, EventEmitter);

function manageNotification(channel) {
	return getResponse().then((message) => {
		self.emit('sendMessage', message, channel);
	});
}

function getResponse() {
	let deferred = q.defer();
	request({
		url: URL,
		method: 'GET',
		gzip: true,
		headers: HEADERS
	}, (error, response, body) => {
		console.info('response "savoirinutile"', response.statusCode);
		if (!error && response.statusCode == 200) {
			var domUtils = require('htmlparser2').DomUtils;
			var handler = new htmlparser.DomHandler((err, dom) => {
				var phrase = domUtils.findAll((elem) => {
					if (matches(elem)) {
						return true;
					}
					return false;
				}, dom);

				if (hasData(phrase)) {
					deferred.resolve(resolveData(phrase));
				}
				else {
					deferred.reject();
				}
			});
			new htmlparser.Parser(handler).parseComplete(body);
		} else {
			deferred.reject();
		}
	});
	return deferred.promise;
}

function matches(elem) {
	return elem.attribs && elem.attribs.id === 'phrase';
}

function hasData(data) {
	return data.length > 0
		&& data[0].children.length > 0
		&& data[0].children[0].data;
}

function resolveData(data) {
	return data[0].children[0].data.trim();
}

module.exports = SavoirInutile;
