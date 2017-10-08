'use strict'

var http = require('http');
var url = require('url')
var fs = require('fs');
var path = require('path');

<<<<<<< HEAD
const tzwhere = require('tzwhere');
const parsetime = require('parsetime')

const TeleBot = require('telebot');

tzwhere.init()

var schedule = require('node-schedule');
=======
>>>>>>> cea68800b580167006c4d13aa90c01732a360929

const bot = require('./bot.js');

<<<<<<< HEAD
	polling: { // Optional. Use polling.
		interval: 1000, // Optional. How often check updates (in ms).
		timeout: 0, // Optional. Update polling timeout (0 - short polling).
		limit: 100, // Optional. Limits the number of updates to be retrieved.
		retryTimeout: 5000 // Optional. Reconnecting timeout (in ms).
	}
});

var sent_invites = new Object();
var events = new Object();
=======
>>>>>>> cea68800b580167006c4d13aa90c01732a360929

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

<<<<<<< HEAD
/************************Start*********************/
var timezone_lookup = new Object();
=======
	
bot.on(/^\/name (.+)$/, (msg, props) => {
	let name = props.match[1];
	const id = msg.chat.id
	bot.sendMessage(id, name)
	bot.setChatTitle(id, name)

//bot.on(['/start','/hello'], (msg) => {
//	bot.sendMessage(msg.from.id, 'Please enter your event name')
});

bot.on(/^\/location (.+)$/, (msg, props) => {
	let location = props.match[1];
	bot.sendMessage(msg.from.id, location)
});

bot.on(/^\/date (.+)$/, (msg, props) => {
	let date = props.match[1];
	bot.sendMessage(msg.from.id, date)
});



	

var reminders = []



/*********************CheckIn**********/
>>>>>>> cea68800b580167006c4d13aa90c01732a360929

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


var attendees = {};

function attendeeToString(attendee) {
    return attendee.first_name + ' ' + attendee.last_name + ' (' + attendee.username + ')';
}


bot.on(['/checkin'], (msg) => {
	attendees[msg.from.id] = msg.from;
	console.log(attendeeToString(msg.from) + ' has checked in');
});


bot.on(['/attendeeCount'], (msg) => {
	bot.sendMessage(msg.chat.id, Object.keys(attendees).length);
});


bot.on(['/attendeeList'], (msg) => {
	if(Object.keys(attendees).length == 0) {
		bot.sendMessage(msg.chat.id, 'There are no people in attendence');
	} else {
		let reply = Object.values(attendees).map(attendeeToString).join('\n');
		bot.sendMessage(msg.chat.id, reply);
	}
});


bot.on(['/clearAttendees'], (msg) => {
	attendees = {};
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
