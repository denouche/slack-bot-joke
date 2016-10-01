'use strict';

require('console-stamp')(console);

var Slack = require('slack-client'),
    token = process.env.SLACK_TOKEN,
    catchall = require('./catchall/catchall-service.js'),
    serviceFactory = require('./servicefactory/service-factory.js'),
    jokeProviders = serviceFactory.getService('blagues'),
    chatons = serviceFactory.getService('chatons'),
    poils = serviceFactory.getService('poils'),
    excusesdedev = serviceFactory.getService('excusesdedev'),
    savoirinutile = serviceFactory.getService('savoirinutile'),
    citation = serviceFactory.getService('citations'),
    citationInverse = serviceFactory.getService('citationsinverse'),
    pony = serviceFactory.getService('pony');

var slack = new Slack(token, true, true),
    providersOption = {
        maxLength: 600
    };


slack.on('open', function () {
    var channels = Object.keys(slack.channels)
        .map(function (k) { return slack.channels[k]; })
        .filter(function (c) { return c.is_member; })
        .map(function (c) { return c.name; });

    var groups = Object.keys(slack.groups)
        .map(function (k) { return slack.groups[k]; })
        .filter(function (g) { return g.is_open && !g.is_archived; })
        .map(function (g) { return g.name; });

    console.info('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

    if (channels.length > 0) {
        console.info('You are in: ' + channels.join(', '));
    }
    else {
        console.info('You are not in any channels.');
    }

    if (groups.length > 0) {
       console.info('As well as: ' + groups.join(', '));
    }
});

function sendMessages(channel, arrayToSend) {
    setTimeout(function(e) {
        var toSend = arrayToSend.shift();
        if(toSend !== undefined) {
            channel.send(toSend);
        }
        if(arrayToSend.length > 0) {
            sendMessages(channel, arrayToSend);
        }
    }, 50);
}

slack.on('error', function(error) {
    console.error(error);
});

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);

    if (message.type === 'message') {
        var futureFound,
            text = message.text.toLowerCase();
        switch(true) {
            case /blague/.test(text):
                futureFound = jokeProviders[Math.floor(Math.random() * jokeProviders.length)].get(providersOption)
                    .then(function(data) {
                        sendMessages(channel, data);
                    });
                break;
            case /^savoir(?: inutile)?$/.test(text):
            case /inutile/.test(text):
                futureFound = savoirinutile.get()
                    .then(function(data) {
                        channel.send(data);
                    });
                break;
            case /^excuses?(?: de devs?)?$/.test(text):
            case /^devs?$/.test(text):
                futureFound = excusesdedev.get()
                    .then(function(data) {
                        channel.send(data);
                    });
                break;
            case /^citation$/.test(text):
            case /^film$/.test(text):
                futureFound = citation.get()
                    .then(function(data) {
                        sendMessages(channel, data);
                    });
                break;
            case /^citation\s.+$/.test(text):
            case /^film\s.+$/.test(text):
                var matcher = text.match(/^citation\s(.+)$/) || text.match(/^film\s(.+)$/);
                futureFound = citationInverse.get(matcher[1])
                    .then(function(data) {
                        sendMessages(channel, data);
                    });
                break;
            case /^chaton$/.test(text):
                futureFound = chatons.get()
                    .then(function(data) {
                        channel.postMessage({
                            as_user: true,
                            attachments: [
                                {
                                    fallback: 'chaton: ' + data,
                                    'image_url': data
                                }
                            ]
                        });
                    });
                break;
            case /^pony/.test(text):
                futureFound = pony.get()
                    .then(function(data) {
                        channel.postMessage({
                            as_user: true,
                            attachments: [
                                {
                                    fallback: 'poney: ' + data,
                                    'image_url': data
                                }
                            ]
                        });
                    });
                break;
            default:
                futureFound = catchall.get(text)
                    .then(function(data) {
                        channel.postMessage({
                            as_user: true,
                            attachments: [
                                {
                                    fallback: 'nope: ' + data,
                                    'image_url': data
                                }
                            ]
                        });
                    });
                break;
        }
        futureFound.then(function() {
            // Do nothing
        }, function() {
            poils.get(text)
                .then(function(data) {
                    channel.send(data);
                });
        });
    }
});

slack.login();
