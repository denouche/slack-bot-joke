var htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q'),
	_ = require('lodash'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

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

let self;

let ExcusesDeDev = function () {
	self = this;
	_.forEach(MATCHING_WORS, (word) => {
        this.on(word, (channel) => {
            manageNotification(channel);
        });
    });
};

util.inherits(ExcusesDeDev, EventEmitter);

function manageNotification(channel) {
	return getResponse().then((message) => {
		self.emit('sendMessage', message, channel);
	});
}

function getResponse() {
	var deferred = q.defer();
	request({
		url: URL,
		method: 'GET',
		gzip: true,
		headers: HEADERS
	}, (error, response, body) => {
		console.info('response "excusesdedev"', response.statusCode);
		if (!error && response.statusCode == 200) {
			let domUtils = require('htmlparser2').DomUtils;
			let handler = new htmlparser.DomHandler((err, dom) => {
				var quote = domUtils.findAll(function (elem) {
					if (matches(elem)) {
						return true;
					}
					return false;
				}, dom);

				if (hasData(quote)) {
					deferred.resolve(resolveData(quote));
				} else {
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
	return elem.attribs && elem.attribs.class === 'quote';
}

function hasData(data) {
	return data.length > 0
		&& data[0].children.length > 0
		&& data[0].children[0].data;
}

function resolveData(data) {
	return _.castArray(data[0].children[0].data.trim());
}

module.exports = ExcusesDeDev;
