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
	    url: 'http://www.marrez-vous.com/blague,aleatoire.html',
	    method: 'GET',
	    gzip: true,
	    encoding: 'iso-8859-1',
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'www.marrez-vous.com',
	        'Pragma': 'no-cache',
	        'Upgrade-Insecure-Requests': '1',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "marrez-vous"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var blagues = domUtils.findAll(function (elem) {
	                if(elem.type === 'tag' && elem.name === 'blockquote') {
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
		            blagues[i].children.forEach(function(e) {
		            	if(e.type === 'text' && e.data !== '\r\n') {
		            		charsCount += e.data.length;
		            		toSend.push(e.data);
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

exports.getJoke = getJoke;
