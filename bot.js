const Discord = require('discord.js');
const client = new Discord.Client();
const BtmCmds = require('./bot_commands.js');

const regex_rolled_nat_20 = new RegExp('<@(.*)>, .*\\(.*20.*\\) \\[\\/20\\].* = [0-9]+');
const regex_rolled_nat_1 = new RegExp('<@(.*)>, .*\\((?:[0-9]+ \\+ )*1(?: \\+ [0-9]+)*\\) \\[\\/20\\].* = [0-9]+');

const dnd_class = ['barbarian', 'bard', 'cleric', 'druid', 'dungeon_master', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'];

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

function is_a_command(str) {
	if (str.substring(0, 1) === '!') 
		return true;
	return false;
}

function react_to_message(msg, emoji_name){
	let guild = msg.guild;
	if (guild == undefined){
		console.log('guild undefined');
		return;
	}
	if (!guild.available){
		console.log('guild not available: ' + guild.name);
		return;
	}
	let emojis = guild.emojis;
	let class_emoji_id = emojis.findKey(emoji => emoji.name === emoji_name);
	if (class_emoji_id != null){
		msg.react(class_emoji_id).catch(console.error);
		console.log('reacted ' + emoji_name);
	}
	else
		console.log('emoji not found: ' + emoji_name);
}

function react_class_from_message(msg){
	let guild = msg.guild;
	if (guild == undefined){
		console.log('guild undefined');
		return;
	}
	if (!guild.available){
		console.log('guild not available: ' + guild.name);
		return;
	}
	let author_id = msg.content.match(regex_rolled_nat_20)[1];
	console.log('author_id found: ' + author_id);
	dnd_class.forEach(class_name => {
		let role = guild.roles.find(element => element.name == class_name);
		if (role != undefined){
			let user_role = role.members.find(element => element.id == author_id);
			if (user_role != undefined){
				console.log('user is a ' + class_name);
				react_to_message(msg, class_name);
			}
		}
	}
	);
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
		console.log('message received by ' + msg.author.username + ': '
			+ msg.content);
		if (is_a_command(msg.content)) {
			let commands_parts = parse_command_parts(msg.content);
			const command = commands_parts[0];
			const args = commands_parts[1];

			console.log('Command received by ' + msg.author.username + ': '
			+ msg.content);

			BtmCmds.call_command(msg, command, args);
		}
		else {
			if (msg.content.match(regex_rolled_nat_20)){
				react_class_from_message(msg);
			}
			if (msg.content.match(regex_rolled_nat_1)){
				react_to_message(msg, 'nat_1');
			}
		}
	}
});

client.login(process.env.TOKEN)
	.then(console.log)
	.catch(console.error);
