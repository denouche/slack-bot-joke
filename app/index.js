'use strict';

require('console-stamp')(console);

var RtmClient = require('@slack/client').RtmClient,
    CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    WebClient = require('@slack/client').WebClient,
    Bottleneck = require('bottleneck'),
    q = require('q'),
    catchall = require('./catchall/catchall-service.js'),
    serviceFactory = require('./servicefactory/service-factory.js'),
    jokeProviders = serviceFactory.getService('blagues'),
    chatons = serviceFactory.getService('chatons'),
    poils = serviceFactory.getService('poils'),
    excusesdedev = serviceFactory.getService('excusesdedev'),
    savoirinutile = serviceFactory.getService('savoirinutile'),
    citation = serviceFactory.getService('citations'),
    citationInverse = serviceFactory.getService('citationsinverse'),
    pony = serviceFactory.getService('pony'),
    kitten = serviceFactory.getService('kitten'),
    estcequecestbientotleweekend = serviceFactory.getService('estcequecestbientotleweekend'),
    entities = require('entities');

var token = process.env.SLACK_TOKEN,
    limiter = new Bottleneck(1, 1000),
    web = new WebClient(token),
    that = this;

var providersOption = {
        maxLength: 600
    },
    muted = false;

function init() {
    if(token) {
        that.slack = new RtmClient(token, {logLevel: 'warning'});

        that.slack.on(CLIENT_EVENTS.RTM.DISCONNECT, function () {
            console.error('DISCONNECT', arguments);
        });
        that.slack.on(CLIENT_EVENTS.RTM.WS_CLOSE, function () {
            console.error('WS_CLOSE', arguments);
        });
        that.slack.on(CLIENT_EVENTS.RTM.WS_ERROR, function () {
            console.error('WS_ERROR', arguments);
        });
        that.slack.on(CLIENT_EVENTS.RTM.ATTEMPTING_RECONNECT, function () {
            console.error('ATTEMPTING_RECONNECT', arguments);
        });

        that.slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
            that.rtmStartData = rtmStartData;

            var channels = Object.keys(that.rtmStartData.channels)
                .map(function (k) { return that.rtmStartData.channels[k]; })
                .filter(function (c) { return c.is_member; })
                .map(function (c) { return c.name; });
         
            var groups = Object.keys(that.rtmStartData.groups)
                .map(function (k) { return that.rtmStartData.groups[k]; })
                .filter(function (g) { return g.is_open && !g.is_archived; })
                .map(function (g) { return g.name; });
         
            console.info('Welcome to Slack. You are ' + that.rtmStartData.self.name + ' of ' + that.rtmStartData.team.name);
         
            if (channels.length > 0) {
                console.info('You are in: ' + channels.join(', '));
            }
            else {
                console.info('You are not in any channels.');
            }
         
            if (groups.length > 0) {
               console.info('As well as: ' + groups.join(', '));
            }
        });/*
        
        that.slack.on('error', function(error) {
            console.error(error);
        });
*/

        that.slack.on(RTM_EVENTS.MESSAGE, function (event) {
            var channel = getChannelOrDMByID(event.channel);
            if(channel && event.type === 'message') {
                var message;
                switch(event.subtype) {
                    case undefined:
                        // new message
                        message = event;
                        break;
                    case 'message_changed':
                        message = event.message;
                        break;
                    default:
                        console.warn('event, RTM_EVENTS.MESSAGE with unmanaged event subtype ', event.subtype, JSON.stringify(event));
                        break;
                }
                if(message && message.text && !muted) {
                    processMessage(event.channel, entities.decodeHTML(message.text));
                }
            }
        });

        that.slack.start();
    }
}

function processMessage(channel, message) {
    var futureFound,
        text = message.toLowerCase();
    switch(true) {
        case /\bblague\b/.test(text):
            futureFound = jokeProviders[Math.floor(Math.random() * jokeProviders.length)].get(providersOption)
                .then(function(data) {
                    sendMessages(channel, data);
                });
            break;
        case /\bsavoir\b/.test(text):
        case /\binutile\b/.test(text):
            futureFound = savoirinutile.get()
                .then(function(data) {
                    sendMessages(channel, [data]);
                });
            break;
        case /\bexcuses?\b/.test(text):
        case /\bdev(?:eloper)?\b/.test(text):
            futureFound = excusesdedev.get()
                .then(function(data) {
                    sendMessages(channel, [data]);
                });
            break;
        case /\bcitation\b/.test(text):
        case /\bfilm\b/.test(text):
            futureFound = citation.get()
                .then(function(data) {
                    sendMessages(channel, data);
                });
            break;
        case /\bcitation\s.+$/.test(text):
        case /\bfilm\s.+$/.test(text):
            var matcher = text.match(/^citation\s(.+)$/) || text.match(/^film\s(.+)$/);
            futureFound = citationInverse.get(matcher[1])
                .then(function(data) {
                    sendMessages(channel, data);
                });
            break;
        case /\bchaton\b/.test(text):
            futureFound = chatons.get()
                .then(function(data) {
                    var data = {
                        as_user: true,
                        attachments: [
                            {
                                fallback: 'chaton: ' + data,
                                'image_url': data
                            }
                        ]
                    };
                    web.chat.postMessage(channel, '', data, function() {});
                });
            break;
        case /\b(?:pony|ponies|poney|cheval|horse)\b/.test(text):
            futureFound = pony.get()
                .then(function(data) {
                    var data = {
                        as_user: true,
                        attachments: [
                            {
                                fallback: 'poney: ' + data,
                                'image_url': data
                            }
                        ]
                    };
                    web.chat.postMessage(channel, '', data, function() {});
                });
            break;
        case /\b(?:kitten|cat|chat|god)\b/.test(text): 
            futureFound = kitten.get()
                .then(function(data) {
                    var data = {
                        as_user: true,
                        attachments: [
                            {
                                fallback: 'kitten: ' + data,
                                'image_url': data
                            }
                        ]
                    };
                    web.chat.postMessage(channel, '', data, function() {});
                });
            break;
	case /\b(?:week-?end)\b/.test(text):
            futureFound = estcequecestbientotleweekend.get()
                .then(function(data) {
                    sendMessages(channel, data);
                });
            break;
        case /\b(?:chut|tais[-\s]toi|ta gueule)\b/.test(text):
            muted = true;
            setTimeout(function() {
                muted = false;
            }, 10000*60);
            futureFound = q.when();
            break;
        default:
            futureFound = catchall.get(text)
                .then(function(data) {
                    var data = {
                        as_user: true,
                        attachments: [
                            {
                                fallback: 'nope: ' + data,
                                'image_url': data
                            }
                        ]
                    };
                    web.chat.postMessage(channel, '', data, function() {});
                });
            break;
    }
    futureFound.then(function() {
        // Do nothing
    }, function() {
        poils.get(text)
            .then(function(data) {
                sendMessages(channel, [data]);
            });
    });
}

function sendMessages(channelId, arrayToSend) {
    limiter.submit(function(toSendArray, done) {
        var toSend = toSendArray.shift();
        if(toSend !== undefined) {
            that.slack.sendMessage(toSend, channelId);
        }
        if(toSendArray.length > 0) {
            sendMessages(channelId, toSendArray);
        }
        done();
    }, arrayToSend, function() {
        // done function, callback needed
    });
}

function getChannelOrDMByID(channelId) {
    var channel = _.find(that.rtmStartData.channels, { id: channelId });
    var ims = _.find(that.rtmStartData.ims, { id: channelId });
    var group = _.find(that.rtmStartData.groups, { id: channelId });
    return channel || ims || group;
}

init();
