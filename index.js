'use strict'

const http = require('http');
const bot = require('./bot.js');
var https = require('https');


http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);


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


bot.on(['/getDate'], (msg) => {
	bot.sendMessage(msg.chat.id, date);
});


bot.on(['/getLocation'], (msg) => {
	bot.sendMessage(msg.chat.id, location);
});


/*********************CheckIn**********/


var attendees = {};

function attendeeToString(attendee) {
    return attendee.first_name + ' ' + attendee.last_name + ' (' + attendee.username + ')';
}


bot.on(['/checkin'], (msg) => {
	let my_attendee_list = new Object();
	if(msg.chat.id in attendees){
		my_attendee_list = attendees[msg.chat.id]
	}
	my_attendee_list[msg.chat.id][msg.from.id] = msg.from;
	console.log(attendeeToString(msg.from) + ' has checked in');
});


bot.on(['/attendeeCount'], (msg) => {
	bot.sendMessage(msg.chat.id, Object.keys(attendees[msg.chat.id]).length);
});


bot.on(['/attendeeList'], (msg) => {
	if(Object.keys(attendees[msg.chat.id]).length == 0) {
		bot.sendMessage(msg.chat.id, 'There are no people in attendence');
	} else {
		let reply = Object.values(attendees[msg.chat.id]).map(attendeeToString).join('\n');
		bot.sendMessage(msg.chat.id, reply);
	}
});


bot.on(['/clearAttendees'], (msg) => {
	attendees = {};
});

/**************************LINKING**************/
// https://t.me/joinchat/G0BAhkLtT44bjTBX-bl6iQ
bot.on(['/shareLink'], (msg) => {
	https.get('https://api.telegram.org/bot457195654:AAHVNzh7SVXQr1wpLKw75x_7h_snj1IlA5Y/exportChatInviteLink?chat_id=' + msg.chat.id, (res) => {
		let raw = '';
		res.on('data', (d) => {
			raw += d;
		});

		res.on('end', () => {
			let json = JSON.parse(raw)

			if(json && json.result){
				let link = json.result;
				let split = link.split('/');
				let linkBottom = split[split.length - 1];
				let startGroupLink = 'https://telegram.me/smrtgroupbot?startgroup=' + linkBottom;
				bot.sendMessage(msg.chat.id, startGroupLink);
			} else {
				bot.sendMessage(msg.chat.id, 'Unable to get invite link!!\nMake sure the SmartGroupBot has admin right to invite users via link and the current group is upgraded to a supergroup');
			}
		});
	});
});

bot.on(/^\/start@smrtgroupbot (.+)$/, (msg, props) => {
	let link = 'https://t.me/joinchat/' + props.match[1];
	bot.sendMessage(msg.chat.id, 'Hello everybody, if you are interested in joining the <insert name here> study group follow this link: ' + link);
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