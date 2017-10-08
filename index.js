'use strict'

var http = require('http');
var url = require('url')
var fs = require('fs');
var path = require('path');

const tzwhere = require('tzwhere');
const parsetime = require('parsetime')

const TeleBot = require('telebot');

tzwhere.init()

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

var sent_invites = new Object();
var events = new Object();

http.createServer(function (request, response) {
	var parsedUrl = url.parse(req.url, true); // true to get query as object
	var q = parsedUrl.query;
	
	if('start' in q){
		if(q['start'] in sent_invites){
			
		}
	}

	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);

/************************Start*********************/
var timezone_lookup = new Object();

fs.readFile('./timezone.json', function(err, data){
	if(!err)timezone_lookup = JSON.parse(data)
});

bot.on('/updatelocation', function (msg){
    const replyMark = bot.keyboard([
	[{
		text: 'Send my location',
		request_location: true
	}],
	['Cancel']], {once:true, resize:true})
    bot.sendMessage(msg.chat.id, "Input timezone:", {replyMarkup: replyMark})
});

bot.on('location', (loc) => {
	bot.sendMessage(loc.chat.id, 'Location: '.concat(loc.location.latitude).concat(loc.location.longitude))
	bot.sendMessage(loc.chat.id, 'Timezone: '.concat(tzwhere.tzNameAt(loc.location.latitude,loc.location.longitude)))
	
	timezone_lookup[loc.from.id] = tzwhere.tzOffsetAt(loc.location.latitude,loc.location.longitude)
	
	fs.unlink('./timezone.json', (err) => {} )
	fs.writeFile('./timezone.json', JSON.stringify(timezone_lookup), (err) => {})
})

bot.on('/time', function(msg){
	msg.reply.text(new Date())
})

bot.on(/^\/event\s(.+)/, function (msg, prop){
	if (!(msg.from.id in timezone_lookup)){
		bot.sendMessage(msg.chat.id, 'Cannot schedule events without the user\'s time zone. The timezone is determined by providing the user location. Run /updatelocation before using events.');
	}else{
		const msg_data = prop.match[1].split(/,(\s+)/)
		const extracted_time = msg_data[msg_data.length - 1]
		const name = msg_data.slice(0,msg_data.length-1).join('').trim()
		
		var unixTime = parsetime(extracted_time).absolute
		if(unixTime == 0){
			bot.sendMessage(msg.chat.id, 'Unrecognized time format.');
		}else{
			var time = new Date(parsetime(extracted_time + '2017').absolute)
			time = new Date(time.valueOf() + time.getTimezoneOffset() * 60 * 1000 + timezone_lookup[msg.from.id])
			bot.sendMessage(msg.chat.id, 'Created new event: ' + (name || 'Unnamed') + ' @ ' + time)
			
			const j = schedule.scheduleJob(time, function(chat_id, msg_id, event_name){
				if(events[name] == true)
					bot.sendMessage(chat_id, 'It\'s time for this event!: ' + event_name, {replyToMessage: msg_id});
				delete events[name]
			}.bind(null, msg.chat.id, msg.message_id, name));
			
			events[name] = true
		}
	}
});

bot.on(/^\/cancel\s(.+)/, function(msg, prop){
	const name = prop.match[1].trim()
	
	if(!(name in events)){
		bot.sendMessage(msg.chat.id, 'Could not find event, ' + name)
		bot.sendMessage(msg.chat.id, Object.keys(events))
	}else{
		bot.sendMessage(msg.chat.id, 'Cancelling event: ' + name)
		events[name] = false
	}
});

bot.start();
