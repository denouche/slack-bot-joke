var q = require('q'),
    _ = require('lodash'),
    services = process.env.BOT_SERVICES,
    jokeProviders = [
        require('../jokes/providers/humour-blague-service.js'),
        require('../jokes/providers/marrez-vous-service.js'),
        require('../jokes/providers/labanane-service.js')
    ],
    chatons = require('../chatons/ditesleavecdeschatons-service.js'),
    poils = require('../poils/poils-service.js'),
    excusesdedev = require('../excusesdedev/excusesdedev-service.js'),
    savoirinutile = require('../savoirinutile/savoirinutile-service.js'),
    citation = require('../kaakook/kaakook-service.js'),
    mock = require('./mock.js');

var existingServices = {
    "jokeProviders": jokeProviders,
    "chatons": chatons,
    "poils": poils,
    "excusesdedev": excusesdedev,
    "savoirinutile": savoirinutile,
    "citation": citation
};

if (services) {
    services = services.split(',');
}

function getService(serviceName) {
    if (services && !_.contains(services, serviceName)) {
        if (existingServices[serviceName] && Array.isArray(existingServices[serviceName])){
            return new Array(mock);
        }
        return mock;
    }
    return existingServices[serviceName];
}

exports.getService = getService;
