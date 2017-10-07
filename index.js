'use strict'

const TeleBot = require('telebot');
const bot = new TeleBot('457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y');


bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
