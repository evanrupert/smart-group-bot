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

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
