var htmlparser = require('htmlparser2'),
	request = require('request'),
	Entities = require('html-entities').AllHtmlEntities,
	q = require('q');

var entities = new Entities();

function getJoke(options) {
	return futureJoke().then(function(data) {
		var charsCount = 0;
		data.forEach(function(e) {
			charsCount += e.length;
		});
		return charsCount > options.maxLength ? getJoke(options) : data;
	})
}

function futureJoke() {
	var deferred = q.defer();
	request({
	    url: 'http://humour-blague.com/blagues-2/index.php',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'humour-blague.com',
	        'Pragma': 'no-cache',
	        'Upgrade-Insecure-Requests': '1',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "humour-blague"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var blagues = domUtils.findAll(function (elem) {
	                if(elem.attribs && elem.attribs.class === 'blague') {
	                    return true;
	                }
	                return false;
	            }, dom);

	            var toSend = [];
	            blagues[0].children.forEach(function(e) {
	            	if(e.type === 'text') {
	            		var text = entities.decode(e.data.trim());
	            		text = text.replace(/\s*\n\s*/, ' ');
	            		toSend.push(text);
	            	}
	            });
	            deferred.resolve(toSend);
	        });
	        new htmlparser.Parser(handler).parseComplete(body);
	    }
	    else {
	    	deferred.reject();
	    }
	});
	return deferred.promise;
}

exports.getJoke = getJoke;
