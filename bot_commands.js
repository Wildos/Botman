const CmdRoll = require('./roll_commands.js');


const valid_commands = {
	'roll' : CmdRoll.roll_command,
	'gmRoll' : CmdRoll.gmroll_command,
	'gmroll' : CmdRoll.gmroll_command
};

module.exports.call_command = function(origin, command, args) {
	if (command in valid_commands) {
		(valid_commands[command])(origin, args);
	}
};
