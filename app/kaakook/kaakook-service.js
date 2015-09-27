var htmlparser = require('htmlparser2'),
	request = require('request'),
	q = require('q');

function getCitation() {
	var deferred = q.defer();
	request({
	    url: 'http://www.kaakook.fr/',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'www.kaakook.fr',
	        'Pragma': 'no-cache',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "kaakook"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var quote = domUtils.findAll(function (elem) {
	                if(elem.attribs && elem.attribs.class === 'citation') {
	                    return true;
	                }
	                return false;
	            }, dom);

				var toSend = [];
	    		if(quote.length > 0 
	    			&& quote[0].children.length > 0) {
					toSend.push(quote[0].children[1].children[1].children[0].data.trim());
					toSend.push(quote[0].children[3].children[1].children[0].children[0].data.trim() + quote[0].children[3].children[2].data.trim());
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

exports.getCitation = getCitation;
