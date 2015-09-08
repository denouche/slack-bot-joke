var htmlparser = require('htmlparser2'),
	request = require('request'),
	iconv  = require('iconv-lite'),
	q = require('q')
    _ = require('lodash');

iconv.extendNodeEncodings();

function getLink() {
	var deferred = q.defer();
	request({
	    url: 'http://ditesleavecdeschatons.tumblr.com/random',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'ditesleavecdeschatons.tumblr.com',
	        'Pragma': 'no-cache',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response "ditesleavecdeschatons"', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var photo = domUtils.findAll(function (elem) {
	                if(elem.attribs && elem.attribs.class === 'photo') {
	                    return true;
	                }
	                return false;
	            }, dom);

	    		if(photo.length > 0) {
                    var aLink = _.find(photo[0].children, {type: 'tag', name: 'a'});
                    if(aLink) {
                        var img = _.find(aLink.children, {type: 'tag', name: 'img'});
                        if(img && img.attribs && img.attribs.src) {
                            deferred.resolve(img.attribs.src);
                        }
                        else {
                            deferred.reject();
                        }
                    }
                    else {
                        deferred.reject();
                    }
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

exports.getLink = getLink;
