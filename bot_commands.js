const CmdRoll = require('./roll_commands.js');
const GifReply = require('./gif_reply.js')

const valid_commands = {
	'roll' : CmdRoll.roll_command,
	'gmRoll' : CmdRoll.gmroll_command,
	'gmroll' : CmdRoll.gmroll_command,
	'wildfireball' : GifReply.send_wild_fireball
};

module.exports.call_command = function(origin, command, args) {
	if (command in valid_commands) {
		(valid_commands[command])(origin, args);
	}
};
