var q = require('q'),
    _ = require('lodash'),
    services = process.env.BOT_SERVICES ? process.env.BOT_SERVICES.split(',') : null,
    WeekEnd = require('../estcequecestbientotleweekend/estcequecestbientotleweekend-service.js'),
    SavoirInutile = require('../savoirinutile/savoirinutile-service.js'),
    ExcusesDeDev = require('../excusesdedev/excusesdedev-service.js'),
    TheCatApi = require('../kitten/thecatapi-service.js'),
    Pony = require('../pony/pony.js'),
    Chatons = require('../chatons/ditesleavecdeschatons-service.js'),
    Joke = require('../jokes/jokes-service.js'),
    Citation = require('../kaakook/kaakook-service.js'),
    CitationInverse = require('../kaakookinverse/kaakookinverse-service.js');

var existingServices = {
    'estcequecestbientotleweekend': new WeekEnd(),
    'savoirinutile': new SavoirInutile(),
    'excusesdedev': new ExcusesDeDev(),
    'kitten': new TheCatApi(),
    'pony': new Pony(),
    'chatons': new Chatons(),
    'blagues': new Joke(),
    'citations': new Citation(),
    'citationsinverse': new CitationInverse()
};

function getServices() {
    let result = []
    _.forEach(services, (service) => {
        if(existingServices[service]) {
            result.push(existingServices[service])
        }
    });
    return result;
}

exports.getServices = getServices;
