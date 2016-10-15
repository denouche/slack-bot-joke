let request = require('request'),
    q = require('q'),
    _ = require('lodash'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,

    providers = [
        require('./providers/humour-blague-service.js'),
        require('./providers/marrez-vous-service.js'),
        require('./providers/labanane-service.js')
    ],
    providersOption = {
        maxLength: 600
    };

const MATCHING_WORS = ['blague', 'blagues'];

let self;

let Joke = function () {
    self = this;
    _.forEach(MATCHING_WORS, (word) => {
        this.on(word, (channel) => {
            manageNotification(channel);
        });
    });
};

util.inherits(Joke, EventEmitter);

function manageNotification(channel) {
    return getResponse().then((message) => {
        self.emit('sendMessage', message, channel);
    });
}

function getResponse() {
    return providers[Math.floor(Math.random() * providers.length)].get(providersOption);
}

module.exports = Joke;