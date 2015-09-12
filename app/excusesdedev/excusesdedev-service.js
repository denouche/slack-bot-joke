var htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q');

function getExcuse() {
	var deferred = q.defer();
	request({
	    url: 'http://www.excusesdedev.com/',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'www.excusesdedev.com',
	        'Pragma': 'no-cache',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "excusesdedev"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var quote = domUtils.findAll(function (elem) {
	                if(elem.attribs && elem.attribs.class === 'quote') {
	                    return true;
	                }
	                return false;
	            }, dom);

	    		if(quote.length > 0 
	    			&& quote[0].children.length > 0
	    			&& quote[0].children[0].data) {
	    			deferred.resolve(quote[0].children[0].data.trim());
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

exports.getExcuse = getExcuse;
