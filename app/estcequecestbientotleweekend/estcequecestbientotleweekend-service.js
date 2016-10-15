let htmlparser = require('htmlparser2'),
    request = require('request'),
    q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

const URL = 'http://estcequecestbientotleweekend.fr/';
const HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'deflate, gzip',
    'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
};

let self;

let WeekEnd = function () {
    self = this;
    this.on('weekend', (channel) => {
        getResponse().then(function (message) {
            self.emit('sendMessage', message, channel);
        });
    });
};

util.inherits(WeekEnd, EventEmitter);

function getResponse() {
    let deferred = q.defer();
    request({
        url: URL,
        method: 'GET',
        gzip: true,
        headers: HEADERS
    }, function (error, response, body) {
        console.info('response from "estcequecestbientotleweekend"', response.statusCode);
        if (!error && response.statusCode == 200) {
            let domUtils = require('htmlparser2').DomUtils;
            let handler = new htmlparser.DomHandler((err, dom) => {
                let image = domUtils.findAll((elem) => {
                    if (matches(elem)) {
                        return true;
                    }
                    return false;
                }, dom);

                if (hasData(image)) {
                    deferred.resolve(resolveData(image));
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
    return elem.type === "tag" && elem.name === 'p' && elem.attribs.class == 'msg';
}

function hasData(data) {
    return data.length > 0 && data[0].children.length > 0;
}

function resolveData(data) {
    let response = data[0].children[0].data;
    response = response.replace(/(?:\n|\r|\t|  +)/g, '');
    return _.castArray(response);
}

module.exports = WeekEnd;