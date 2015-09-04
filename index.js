'use strict';

var Slack = require('slack-client'),
    htmlparser = require('htmlparser2'),
	request = require('request'),
	Entities = require('html-entities').AllHtmlEntities,
    token = process.env.SLACK_TOKEN;

var entities = new Entities(),
    slack = new Slack(token, true, true);

require('console-stamp')(console);

function blague(channel) {
	request({
	    url: 'http://humour-blague.com/blagues-2/index.php',
	    method: 'GET',
	    gzip: true,
	    headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'Accept-Encoding': 'deflate, gzip',
	        'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4',
	        'Cache-Control': 'no-cache',
	        'Connection': 'keep-alive',
	        'Host': 'humour-blague.com',
	        'Pragma': 'no-cache',
	        'Upgrade-Insecure-Requests': '1',
	        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
	    }
	}, function (error, response, body) {
		console.info('response', response.statusCode);
	    if(!error && response.statusCode == 200) {
	    	var domUtils = require('htmlparser2').DomUtils;
	    	var handler = new htmlparser.DomHandler(function(err, dom) {
	    		var blagues = domUtils.findAll(function (elem) {
	                if(elem.attribs.class === 'blague') {
	                    return true;
	                }
	                return false;
	            }, dom);
	            blagues[0].children.forEach(function(e) {
	            	if(e.type === 'text') {
	            		channel.send(entities.decode(e.data));
	            	}
	            });
	        });
	        new htmlparser.Parser(handler).parseComplete(body);
	    }
	});
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
 
slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);

    if (message.type === 'message') {
        if(message.text === 'blague') {
        	console.info('blague asked by', user.name);
        	blague(channel);
        }
    }
});

slack.login();

