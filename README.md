 SmartGroupBot: The handy Telegram bot for coordinating group events!


# Features

  - Shares join event group link to main chat 
  - Sends event reminders at user generated intervals
  - Notifies group members at time of event
  - Tracks attendance at each event via member check-in

Add SmartGroupBot [Here](https://telegram.me/smrtgroupbot)! 

# Bot Commands
```sh
SETUP COMMANDS

	/setName <name>            //Sets name of event and event chat
	/setLocation               //sets location of the event
	/setDate <date> <time>     //sets date of and time of the event
	/setDate <timer>           //sets the event to start in <timer>
	/shareLink                 //responds with link to share to  main group
	/notify <number> <unit> <before/after>
				   //Adds an event notification for the main event some time before or after. Units can be seconds, hours, days, or some abbreviation. Number must be a string of digits.
	/event <name>, <time/date string>
				   //Adds an event with the given name at the given time.
	

GROUP COMMANDS

	/checkIn                   //checks user into the event
	/checkOut		   //checks user out of the event
	/attendeeCount             //responds with the number of people who have checked in
	/attendeeList              //responds with a list of the people who have checked in
	/updateTimeZone            //updates time zone of the event
	/cancel                    //cancels event'
	/help                      //opens help directory
```

Dependencies:
  - parsetime
  - node-schedule
  - telebot
  - tzwhere
