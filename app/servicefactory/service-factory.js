var q = require('q'),
    _ = require('lodash'),
    services = process.env.BOT_SERVICES ? process.env.BOT_SERVICES.split(',') : null;

var existingServices = {
    'blagues': [
        require('../jokes/providers/humour-blague-service.js'),
        require('../jokes/providers/marrez-vous-service.js'),
        require('../jokes/providers/labanane-service.js')
    ],
    'chatons': require('../chatons/ditesleavecdeschatons-service.js'),
    'poils': require('../poils/poils-service.js'),
    'excusesdedev': require('../excusesdedev/excusesdedev-service.js'),
    'savoirinutile': require('../savoirinutile/savoirinutile-service.js'),
    'citations': require('../kaakook/kaakook-service.js'),
    'citationsinverse': require('../kaakookinverse/kaakookinverse-service.js'),
    'pony': require('../pony/pony.js'),
    'kitten': require('../kitten/thecatapi-service.js'),
    'estcequecestbientotleweekend': require('../estcequecestbientotleweekend/estcequecestbientotleweekend-service.js')
};

function getMock() {
    return {
        get: function() {
            var deferred = q.defer();
            deferred.reject();
            return deferred.promise;
        }
    };
}

function getService(serviceName) {
    if (services && !_.includes(services, serviceName)) {
        if (_.isArray(existingServices[serviceName])){
            return [getMock()];
        }
        return getMock();
    }
    return existingServices[serviceName];
}

exports.getService = getService;
