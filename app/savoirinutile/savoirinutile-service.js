var htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q');

function getSavoirInutile() {
	var deferred = q.defer();
	request({
	    url: 'http://www.savoir-inutile.com/',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'www.savoir-inutile.com',
	        'Pragma': 'no-cache',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "savoirinutile"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var phrase = domUtils.findAll(function (elem) {
	                if(elem.attribs && elem.attribs.id === 'phrase') {
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

exports.get = getSavoirInutile;
