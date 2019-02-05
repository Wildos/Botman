const Discord = require('discord.js');
const client = new Discord.Client();
const BtmErr = require('./btm_error_handler');
const RollEval = require('./roll_eval.js');
var wd = require('word-definition');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
	if (process.env.AUTHORIZED_CHANNELS.includes(msg.channel.name)
		|| msg.channel.type === 'dm') {
		if (msg.content.substring(0, 1) == '!') {
			let args = msg.content.substring(1).split(' ');
			const cmd = args[0];
			let response = '';

			args = args.splice(1);
			console.log('Command received by ' + msg.author.username + ': '
				+ msg.content);
			switch (cmd) {
			case 'roll':
				response = RollEval.getRoll(args[0], msg);
				if (response != '') {
					msg.reply('rolled ' + response)
						.then(() => console.log('Sent a reply to ' +
								msg.author.username + ' : ' + response))
						.catch(console.error);
				}
				break;
			case 'gmroll':
			case 'gmRoll':
				var gm = client.users.find('id', process.env.ACTUAL_GM);
				if (gm == null) {
					BtmErr.replyError('UNKNOWN_GM', msg, '');
				} else {
					response = RollEval.getRoll(args[0], msg);
					if (response != '') {
						gm.send(msg.author.username + ' rolled' + response)
							.then(msg.reply('your roll have been sent to the GM'))
							.catch(console.error);
					}
				}
				break;
			case 'def':
				var word = args[0];
				if (word == undefined)
				{
					msg.reply('Usage: !def [word] <language>.\n language known: \'en\', \'fr\', \'de\'.');
					break;
				}
				var lang = 'fr';
				if (args[1] != undefined) {
					var tmp = args[1];
					if (tmp == 'en' || tmp == 'fr' || tmp == 'de')
						lang = args[1];
					else {
						msg.reply('Only the language \'en\' (english), \'fr\' (french) and \'de\' (german) are known.');
						break;
					}
				}
				wd.getDef(args[0], lang, null, function (wiki_data) {
					if (wiki_data == undefined || wiki_data.definition == undefined) {
						msg.reply('The word \'' + word + '\' isn\'t known.');
						console.log('Unkown word ' + word);
					}
					else {
						response = wiki_data.definition;
						msg.reply('\'' + args[0] + '\' : ' + response)
							.then(() => console.log('Sent a reply to ' +
									msg.author.username + ' : ' + response))
							.catch(console.error);
					}
				});
				break;
			case 'help':
				msg.reply('\n'
						+ '##Commands:\n'
						+ '**!def [word] <language>.**\n\n'
						+ '**!roll [roll_format]**: make a roll according to format.\n'
						+ '**!gmroll [roll_format]**: make a roll according to format'
						+ ' and send it to the actual GM.\n'
						+ '**!gmRoll [roll_format]**: same as gmroll\n\n'
						+ '##Known language\n'
						+ '- \'fr\' : French\n'
						+ '- \'en\' : English\n'
						+ '- \'de\' : German\n\n'
						+ '##Roll_format\n'
						+ '- **[valid_word]**\n'
						+ '- <range_number *default: 100*>\n'
						+ ' - <dices_number *default: 1*>**d[range_number]**\n'
						+ '- **[range_number](+ -)[modifier_number]**\n'
						+ '- <dices_number *default: 1*>**d[range_number](+ -)'
						+ '[modifier_number]**\n'
						+ '- <value optionnal>, **[required value]**, **(one of'
						+ ' the values)**\n\n'
						+ RollEval.getValidWordString()
						+ '\nSource code: [https://github.com/Wildos/Botman]\n'
				)
					.then(() => console.log('Sent help to ' +
							msg.author.username))
					.catch(console.error);
				break;
			}
		}
	}
});

client.login(process.env.TOKEN)
	.then(console.log)
	.catch(console.error);
