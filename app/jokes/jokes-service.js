let Service = require('../service'),

    providers = [
        require('./providers/humour-blague-service.js'),
        require('./providers/marrez-vous-service.js'),
        require('./providers/labanane-service.js')
    ],
    providersOption = {
        maxLength: 600
    };

const MATCHING_WORS = ['blague', 'blagues'];

class Joke extends Service {

    getResponse() {
        return providers[Math.floor(Math.random() * providers.length)].get(providersOption);
    }

    getMatchingWords() {
        return MATCHING_WORS;
    }
}

module.exports = Joke;