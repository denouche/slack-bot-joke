'use strict';
let EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    q = require('q'),
    request = require('request'),
    htmlparser = require('htmlparser2');

let self;
class Service extends EventEmitter {

    constructor() {
        super();
        self = this;
        _.forEach(this.getMatchingWords(), (word) => {
            this.on(word, (channel) => {
                self.manageNotification(channel);
            });
        });
    }

    manageNotification(channel) {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    getResponse() {
        let deferred = q.defer();
        request({
            url: this.getUrl(),
            method: 'GET',
            gzip: true,
            headers: this.getHeaders()
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let domUtils = require('htmlparser2').DomUtils;
                let handler = new htmlparser.DomHandler((err, dom) => {
                    let image = domUtils.findAll((elem) => {
                        if (self.matches(elem)) {
                            return true;
                        }
                        return false;
                    }, dom);

                    if (self.hasData(image)) {
                        deferred.resolve(self.resolveData(image));
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

    getUrl() {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    getHeaders() {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    getMatchingWords() {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    matches(elem) {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    hasData(data) {
        throw new TypeError("Do not call abstract method foo from child.");
    }

    resolveData(data) {
        throw new TypeError("Do not call abstract method foo from child.");
    }

}
module.exports = Service;