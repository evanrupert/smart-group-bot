'use strict'

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

const TeleBot = require('telebot')

const bot = new TeleBot(
{
	token: '457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y', // Required. Telegram Bot API token.
    webhook: { // Optional. Use webhook instead of polling.

        url: 'https://telegram.me/smrtgroupbot', // HTTPS url to send updates to.
        host: '0.0.0.0', // Webhook server host.
        port: 5000, // Server port.
        maxConnections: 40 // Optional. Maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery
    }
});

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
