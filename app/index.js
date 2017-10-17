'use strict';

require('console-stamp')(console);

var RtmClient = require('@slack/client').RtmClient,
    CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    WebClient = require('@slack/client').WebClient,
    Bottleneck = require('bottleneck'),
    q = require('q'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    entities = require('entities'),
    serviceFactory = require('./servicefactory/service-factory.js'),
    services = serviceFactory.getServices();

var token = process.env.SLACK_TOKEN,
    limiter = new Bottleneck(1, 1000),
    web = new WebClient(token),
    that = this;

var muted = false;

function init() {
    if (process.env.SLACK_TOKEN) {
        that.slack = new RtmClient(process.env.SLACK_TOKEN, { logLevel: 'warning' });

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
            if (channel && event.type === 'message') {
                var message;
                switch (event.subtype) {
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

                if (message && message.text && !muted) {
                    let text = message.text.toLowerCase();
                    let matcher = text.match(/^\S+\s(.+)$/);
                    let config;
                    if (matcher) {
                        config = matcher[1];
                    }

                    if (/(?:chut|tais[-\s]toi|ta gueule)/.test(text)) {
                        muted = true;
                        setTimeout(function () {
                            muted = false;
                        }, 1000 * 60);
                        sendMessages(event.channel, _.castArray('Vous avez sans doute raison, il est temps pour moi de faire une sieste.'));
                    } else {
                        let service = _.find(services, (service) => {
                            return service.canManage(text);
                        });

                        let promise;
                        if (service === undefined) {
                            service = serviceFactory.getService('poils');
                            promise = service.getResponse(text);
                        } else {
                            promise = service.getResponse(config)
                        }

                        promise.then((response) => {
                            if (service.getType() === 'sendMessage') {
                                sendMessages(event.channel, response);
                            } else if (service.getType() === 'sendUrl') {
                                sendImage(event.channel, response, service);
                            }
                        });

                    }
                }
            }
        });

        that.slack.start();
    }
}

function sendMessages(channel, arrayToSend) {
    limiter.submit(function (toSendArray, done) {
        var toSend = toSendArray.shift();
        if (toSend !== undefined) {
            that.slack.sendMessage(toSend, channel);
        }
        if (toSendArray.length > 0) {
            sendMessages(channel, toSendArray);
        }
        done();
    }, arrayToSend, function () {
        // done function, callback needed
    });
}

function sendImage(channel, url, service) {
    var data = {
        as_user: true,
        attachments: [
            {
                fallback: service + ': ' + url,
                'image_url': url
            }
        ]
    };
    web.chat.postMessage(channel, '', data, function () { });
}

function getChannelOrDMByID(channelId) {
    var channel = _.find(that.rtmStartData.channels, { id: channelId });
    var ims = _.find(that.rtmStartData.ims, { id: channelId });
    var group = _.find(that.rtmStartData.groups, { id: channelId });
    return channel || ims || group;
}

init();
