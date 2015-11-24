var htmlparser = require('htmlparser2'),
	request = require('request'),
	Entities = require('html-entities').AllHtmlEntities,
	iconv  = require('iconv-lite'),
	q = require('q');

iconv.extendNodeEncodings();

var entities = new Entities();

function getJoke(options) {
	var deferred = q.defer();
	request({
	    url: 'http://labanane.org/?sort=random',
	    method: 'GET',
	    gzip: true,
	    encoding: 'iso-8859-1',
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'labanane.org',
	        'Pragma': 'no-cache',
	        'Upgrade-Insecure-Requests': '1',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "labanane"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var blagues = domUtils.findAll(function (elem) {
	                if(elem.attribs && (elem.attribs.class === 'item1' || elem.attribs.class === 'item-1')) {
	                    return true;
	                }
	                return false;
	            }, dom);

	    		var i = 0,
	    			charsCount = 0,
	    			toSend = [];
	            while(i === 0 
	            	|| (charsCount > options.maxLength && i < blagues.length)) {
		            charsCount = 0;
		        	toSend = [];
		        	var firstBr = false;
		            blagues[i].children.forEach(function(e) {
		            	if(!firstBr) {
		            		// Before the first br this is the joke title
		            		if(e.type === 'tag' && e.name === 'br') {
		            			firstBr = true;
		            		}
		            	}
		            	else if(e.type === 'text' 
		            		&& e.data !== '\r\n'
		            		&& e.data.trim().length > 0) {
		            		var text = e.data.trim();
		            		charsCount += text.length;
		            		toSend.push(entities.decode(text));
		            	}
		            });
		            i++;
		        }
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

exports.get = getJoke;
