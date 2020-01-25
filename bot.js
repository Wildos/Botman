const Discord = require('discord.js');
const client = new Discord.Client();
const BtmErr = require('./btm_error_handler');
const BtmCmds = require('./bot_commands.js');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

function is_a_command(str) {
	if (str.substring(0, 1) === '!') 
		return true;
	return false;
}

function parse_command_parts(str) {
	let line = str.substring(1);
	let parts = line.split(' ');
	const cmd = parts[0];

	if (parts.length >= 2) {
		const args = parts.splice(1);	
		return [cmd, args];
	}
	return [cmd, []];
}

client.on('message', msg => {
	if (process.env.AUTHORIZED_CHANNELS.includes(msg.channel.name)
		|| msg.channel.type === 'dm') {

		if (is_a_command(msg.content)) {
			let commands_parts = parse_command_parts(msg.content);
			const command = commands_parts[0];
			const args = commands_parts[1];

			console.log('Command received by ' + msg.author.username + ': '
			+ msg.content);
			
			BtmCmds.call_command(msg, command, args);
		}
	}
});

client.login(process.env.TOKEN)
	.then(console.log)
	.catch(console.error);
