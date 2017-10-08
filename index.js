'use strict'
const http = require('http');
const bot = require('./bot.js');

http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);


/*************************StartUp***********/

var name     = 'undefined';
var location = 'undefined';
var date     = 'undefined';


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



bot.start();
