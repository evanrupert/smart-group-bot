'use strict'

var http = require('http');
var url = require('url')
var fs = require('fs');
var path = require('path');

const tzwhere = require('tzwhere');
const parsetime = require('parsetime')
const schedule = require('node-schedule');

tzwhere.init()

const bot = require('./bot.js');
var https = require('https');

var sent_invites = new Object();
var events = new Object();

http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);

var timezone_lookup = new Object();

/*************************StartUp***********/

var name     = 'undefined';
var location = 'undefined';
var date     = 'undefined';


bot.on(/^\/start (.+)$/, (msg, props) => {
	let str = props.match[1];
	bot.sendMessage(msg.chat.id, str);
});


bot.on(/^\/setName (.+)$/, (msg, props) => {
	name = props.match[1];
	let id = msg.chat.id;
	bot.setChatTitle(id, name);
});

bot.on(/^\/setLocation (.+)$/, (msg, props) => {
	location = props.match[1];
});

bot.on(/^\/setDate (.+)$/, (msg, props) => {
	date = props.match[1];
});


bot.on(['/getName'], (msg) => {
	bot.sendMessage(msg.chat.id, name);
});

fs.readFile('./timezone.json', function(err, data){
	if(!err)timezone_lookup = JSON.parse(data)
});

/*********************CheckIn**********/
var attendees = {};
var new_members = {};

function attendeeToString(attendee) {
    return attendee.first_name + ' ' + attendee.last_name + ' (' + attendee.username + ')';
}


bot.on(['/checkin'], (msg) => {
	if(!(msg.chat.id in attendees)){
		attendees[msg.chat.id] = new Object();
	}
	attendees[msg.chat.id][msg.from.id] = msg.from;
	console.log(attendeeToString(msg.from) + ' has checked in');
});


bot.on(['/attendeeCount'], (msg) => {
	if(!(msg.chat.id in attendees))attendees[msg.chat.id] = new Object();
	bot.sendMessage(msg.chat.id, Object.keys(attendees[msg.chat.id]).length);
});


bot.on(['/attendeeList'], (msg) => {
	if(!(msg.chat.id in attendees))attendees[msg.chat.id] = new Object();
	if(Object.keys(attendees[msg.chat.id]).length == 0) {
		bot.sendMessage(msg.chat.id, 'There are no people in attendence');
	} else {
		let reply = Object.keys(attendees[msg.chat.id]).map((key) => attendees[msg.chat.id][key]).map(attendeeToString).join('\n');
		bot.sendMessage(msg.chat.id, reply);
	}
});


bot.on(['/clearAttendees'], (msg) => {
	attendees = {};
});


/********************Reminders*******/
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

const parseTime = function(extracted_time, timezoneOffset){
	var unixTime = parsetime(extracted_time).absolute
	if(unixTime == 0){
		return null
	}else{
		var time = new Date(parsetime(extracted_time).absolute)
		if(time.getFullYear() == '2001'){
			time = new Date(parsetime(extracted_time + ' 2017').absolute)
		}
		
		time = new Date(time.valueOf() + time.getTimezoneOffset() * 60 * 1000 + timezoneOffset)
		return time
	}
}

bot.on(/^\/event\s(.+)/, function (msg, prop){
	if (!(msg.from.id in timezone_lookup)){
		bot.sendMessage(msg.chat.id, 'Cannot schedule events without the user\'s time zone. The timezone is determined by providing the user location. Run /updatelocation before using events.');
	}else{
		const msg_data = prop.match[1].split(/,(\s+)/)
		const extracted_time = msg_data[msg_data.length - 1]
		const name = msg_data.slice(0,msg_data.length-1).join('').trim()
		
		let time = parseTime(extracted_time, timezone_lookup[msg.from.id])
		
		if(time){
			if(time.valueOf() < Date.now()){
				bot.sendMessage(msg.chat.id, 'Time has already passed. Event not created.');
			}else{
				bot.sendMessage(msg.chat.id, 'Created new event: ' + (name || 'Unnamed') + ' @ ' + time)
				
				const j = schedule.scheduleJob(time, function(chat_id, msg_id, event_name){
					if(events[name] == true)
						bot.sendMessage(chat_id, 'It\'s time for this event!: ' + event_name, {replyToMessage: msg_id});
					delete events[name]
				}.bind(null, msg.chat.id, msg.message_id, name));
				
				events[name] = true
			}
		}else{
			bot.sendMessage(msg.chat.id, 'Unrecognized time/date format.');
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

/**************************LINKING**************/
let share_data = new Object();

const randBase64 = function(pool, length){
	let ret = ''
	
	for(var i = 0; i < length; i++){
		ret += pool.charAt(Math.floor(Math.random() * pool.length))
	}
	
	return ret
}

const make_id = function(length){
	while(true){
		let id = randBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length)
		if(!(id in share_data))return id
	}
}

// https://t.me/joinchat/G0BAhkLtT44bjTBX-bl6iQ
bot.on(['/shareLink'], (msg) => {
	https.get('https://api.telegram.org/bot457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y/exportChatInviteLink?chat_id=' + msg.chat.id, (res) => {
		let raw = '';
		res.on('data', (d) => {
			raw += d;
		});
		
		json = JSON.parse(raw);

		if(json && json.result){
			let link = json.result;
			let split = link.split('/');
			let linkBottom = split[split.length - 1];
			
			let id = make_id(10)
			
			share_data[id] = {
				'ref': linkBottom,
				'name': name,
				'loc': '',
				'time': ''
			}
			
			let startGroupLink = 'https://telegram.me/smrtgroupbot?startgroup=' + id
			bot.sendMessage(msg.chat.id, startGroupLink);
		} else {
			bot.sendMessage(msg.chat.id, 'Unable to get invite link!!\nMake sure the SmartGroupBot has admin right to invite users via link and the current group is upgraded to a supergroup');
		}
	});
});

bot.on(/^\/start@smrtgroupbot (.+)$/, (msg, props) => {
	let id = props.match[1]
	
	if(!(id in share_data)){
		console.log('Invalid id: ' + id)
		return
	}

	let link = 'https://t.me/joinchat/' + share_data[id]['ref']
	let group_name = share_data[id]['name']
	
	delete share_data[id]
	
	bot.sendMessage(msg.chat.id, 'Hello everybody, if you are interested in joining the ' + group_name + ' study group follow this link: ' + link);
	bot.leaveChat(msg.chat.id);
});

/*************************TESTING**********************/

bot.on(['/getId'], (msg) => {
	bot.sendMessage(msg.chat.id, msg.chat.id);
})


bot.on(['/test'], (msg) => {
	bot.sendMessage(msg.chat.id, 'Test');
});

bot.start();