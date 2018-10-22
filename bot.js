const Discord = require('discord.js');
const client = new Discord.Client();

function get_roll_message(string) { 
	var fixed_bonus = 0;
	var number_of_roll = 1;
	var number_max = 100;
	var message = "";
	var roll_value = 0;

	if (string != "")
	{
		var str_bonus = string.split('+');
		if (str_bonus.length > 1)
		{// if an + exist
			if (isNaN(str_bonus[1]))
			{
				return "invalid argument: Not a number in bonus: " + str_bonus[1];
			}
			fixed_bonus = parseInt(str_bonus[1]);
		}
		var str_number_roll = str_bonus[0].split('d');
		if (str_number_roll.length == 1)
			str_number_roll = str_bonus[0].split('D');
		if (str_number_roll.length > 1)
		{
			if (str_number_roll[0] != "")
			{
				if (isNaN(str_number_roll[0]))
				{		
					return "invalid argument: Not a number in number of dices: " + str_number_roll[0];
				}
				number_of_roll = parseInt(str_number_roll[0]);
			}
			if (isNaN(str_number_roll[1]))
			{		
				return "invalid argument: Not a number in dice value: " + str_number_roll[1];
			}
			number_max = parseInt(str_number_roll[1]);
		}
		else
		{
			if (isNaN(str_number_roll))
			{			
				return "invalid argument: Not a number in dice value: " + str_number_roll;
			}
			number_max = parseInt(str_number_roll);
		}
	}
	if (number_of_roll == 1 && fixed_bonus == 0)
	{
		roll_value = Math.floor(Math.random() * (number_max + 1));
		message += "" + roll_value + " / " + number_max;
		if (fixed_bonus != 0)
			message += " + " + fixed_bonus + " = " + (roll_value + fixed_bonus);
	}
	else
	{
		if (number_of_roll > 1 || fixed_bonus != 0)
			message += "( ";
		while (number_of_roll > 0)
		{
			var tmp_val = Math.floor(Math.random() * (number_max + 1));
			roll_value = roll_value + tmp_val;
			message += "" + tmp_val;
			number_of_roll--;
			if (number_of_roll != 0)
				message += " + ";
		}
		message += " )"
		if (fixed_bonus != 0)
			message += " + " + fixed_bonus;
		message += " = " + (roll_value + fixed_bonus);
	}
	return message;
}

client.on('ready', () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

client.on('message', msg => {
	if (process.env.AUTHORIZED_CHANNELS.includes(msg.channel.name) || msg.channel.type === "dm")
	{
		if (msg.content.substring(0, 1) == '!') {
			
				var args = msg.content.substring(1).split(' ');
				var cmd = args[0];
				var response = "";
				
				args = args.splice(1);
				console.log('Command received by ' + msg.author.username + ': ' + msg.content);
				if (args[0] == undefined || args[0] == null)
					args[0] = "100";
				switch(cmd) {
				case 'roll':
					response = 'rolled ' + get_roll_message(args[0]);
					if (response.length > 2000)
						msg.reply("Error: response's length exceed limit of discord API.");
					else
						msg.reply(response);
					break;
				case 'gmRoll':
				case 'gmroll':
					var gm = client.users.find("id", process.env.ACTUAL_GM);
					if (gm == null)
						{
							msg.reply('an error ocurred while sending a message to the GM: ' +  gm.username + ".");
							break;
						}
						response = 'The player ' + msg.author + ' rolled ' + get_roll_message(args[0]);
					if (response.length > 2000)
						gm.send("Error: response's length from " + msg.author + " exceed limit of discord API.");
					else
						gm.send(response);
					msg.reply('your roll have been sent to the GM: ' +  gm.username + ".");		
					break;
				}
			}
		}
	});

client.login(process.env.TOKEN);


