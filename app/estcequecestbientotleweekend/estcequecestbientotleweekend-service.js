let htmlparser = require('htmlparser2'),
       request = require('request'),
       q = require('q');

const HEADERS = {
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
       'Accept-Encoding': 'deflate, gzip',
       'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
       'Cache-Control': 'no-cache',
       'Pragma': 'no-cache',
       'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};

function getResponse() {
    let deferred = q.defer();
    request({
        url: 'http://estcequecestbientotleweekend.fr/',
        method: 'GET',
        gzip: true,
        headers: HEADERS
    }, function(error, response, body) {
        console.info('response from "estcequecestbientotleweekend"', response.statusCode);
        if(!error && response.statusCode == 200) {
            let domUtils = require('htmlparser2').DomUtils;
               let handler = new htmlparser.DomHandler((err, dom) => {
                       let image = domUtils.findAll((elem) => {
                       if(elem.type === "tag" && elem.name === 'p' && elem.attribs.class == 'msg'){
                           return true;
                       }
                       return false;
                   }, dom);

                if(image.length > 0 && image[0].children.length > 0) {
                    let response = image[0].children[0].data;
                    response = response.replace(/(?:\n|\r|\t|  +)/g, '');
                    deferred.resolve([response]);
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

exports.get = getResponse;