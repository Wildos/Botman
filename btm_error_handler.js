const Enum = require('enum');

Enum.register();

(function() {
	const validError = new Enum({
		'NONE': 0,
		'MORE_THAN_LENGH_MAX': 1,
		'UNKNOWN_GM': 2,
		'INVALID_COMMAND': 3,
		'INVALID_ARGUMENT': 4,
		'NAN_DICE_NBR': 5,
		'NAN_DICE_RANGE': 6,
	});
	validError.isFlaggable = false;

	const errorMsg = [
		'The length of the response exceed the limit of a discord message.',
		'The GM is not found.',
		'The command is invalid : ',
		'The argument is invalid : ',
		'This is not a valid number of dice : ',
		'This is not a valid number of dice range : ',
	];


	/**
 * Reply to the target with the error message choosen with err_num.
 *
 * @param {String} errEnum (Value in the enum validError)
 * @param {Message} target (The message to reply to)
 * @param {String} strSup (A string to add at the end of the error message)
 */

	module.exports.replyError = function(errEnum, target, strSup) {
		const errNum = validError.get(errEnum).value;
		if (errNum > 0) {
			target.reply(errorMsg[errNum - 1] + strSup)
				.then(() => console.log('Sent a reply to ' +
        target.author.username + ': '
            + errorMsg[errNum - 1] + strSup))
				.catch(console.error);
		} else {
			console.log('ErrEnum received is unknown: ' + errEnum)
				.catch(console.error);
		}
	};
}());
