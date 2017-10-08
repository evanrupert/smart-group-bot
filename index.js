'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');

const bot = require('./bot.js');

http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type': 'text/html' });
	response.end('walrus', 'utf-8');
}).listen(process.env.PORT || 5000);


/*************************StartUp***********/



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
