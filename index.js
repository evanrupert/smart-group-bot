'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');

const TeleBot = require('telebot');

var schedule = require('node-schedule');

const bot = new TeleBot(
{
	token: '457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y', // Required. Telegram Bot API token.

	polling: { // Optional. Use polling.
		interval: 1000, // Optional. How often check updates (in ms).
		timeout: 0, // Optional. Update polling timeout (0 - short polling).
		limit: 100, // Optional. Limits the number of updates to be retrieved.
		retryTimeout: 5000 // Optional. Reconnecting timeout (in ms).
	}
});

var reminders = []

http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);

/************************Start*********************/

bot.on(/^\/event\s(\d+)/, function (msg, prop){
	var time = new Date()
	
	const msg_data = prop.match[1].split('\s')
	const parse_time = msg_data[0].split(':')
	
	time.hours = parse_time[0]
	time.hours = parse_time[1]
	
	bot.sendMessage(msg.from.id, new Date(msg.date * 1000), {replyToMessage: msg.message_id});
	
	const name = msg_data[1]
	
	schedule.scheduleJob(time, function(chat_id, msg_id, event_name){
		bot.sendMessage(chat_id, 'Event ' + event_name, {replyToMessage: msg_id});
	}.bind(null, msg.from.id, msg.message_id, name));
});

bot.start();
