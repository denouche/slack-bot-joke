'use strict';

require('console-stamp')(console);

var Slack = require('slack-client'),
    token = process.env.SLACK_TOKEN,
    jokeProviders = [
    	require('./jokes/providers/humour-blague-service.js'),
    	require('./jokes/providers/marrez-vous-service.js'),
        require('./jokes/providers/labanane-service.js')
    ],
    kittens = require('./kittens/ditesleavecdeschatons-service.js');

var slack = new Slack(token, true, true),
    providersOption = {
        maxLength: 600
    };

function getProvider() {
	return jokeProviders[Math.floor(Math.random() * jokeProviders.length)]
}
 
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
        switch(message.text) {
            case 'blague':
                console.info('blague asked by', user.name);
                getProvider().getJoke(providersOption)
                    .then(function(data) {
                        sendMessages(channel, data);
                    })
                break;
            case 'chaton':
                kittens.getLink()
                    .then(function(data) {
                        channel.postMessage({
                            attachments: [
                                {
                                    fallback: 'ditesleavecdeschatons',
                                    'image_url': data
                                }
                            ]
                        });
                    })
                break;
        }
    }
});

slack.login();

