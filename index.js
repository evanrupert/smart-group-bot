'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');

var express  = require('express');
var app      = express();
var filePath = 'index.html'

app.set('port', (process.env.PORT || 5000));

const TeleBot = require('telebot')

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


bot.on('text', (msg) => msg.reply.text("Server: " + msg));


bot.start();
