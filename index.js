'use strict'

const TeleBot = require('telebot')

const bot = new TeleBot(
{
	token: '457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y', // Required. Telegram Bot API token.
	polling: { // Optional. Use polling.
		interval: 1000, // Optional. How often check updates (in ms).
		timeout: 0, // Optional. Update polling timeout (0 - short polling).
		limit: 100, // Optional. Limits the number of updates to be retrieved.
		retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
	}
});

var stored = []

bot.on(/^\/store (.+)$/, function(msg, props){
	var s = props.match[1];
	msg.reply.text('Adding a new string to store.');
	stored.push(s);
});

bot.on('/print', function(msg){
	var message = '';
	
	for(var i = 0; i < stored.length; i++){
		message.concat(stored[i]);
		message.concat('\n');
	}
	
	bot.sendMessage(msg.from.id, message, {replyToMessage:msg.message_id});
});

bot.start();
