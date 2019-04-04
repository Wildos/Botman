const BtmErr = require('./btm_error_handler');

const validWord = {
	'NONE': -1,
	'easy': 75,
	'facile': 75,
	'basic': 20,
	'basique': 20,
	'medium': 100,
	'moyen': 100,
	'hard': 170,
	'difficile': 170,
	'risky': 200,
	'risque': 200,
	'risqué': 200,
	'danger': 300,
};

/**
 *	Return the string of all valid word values
 *
 * @returns {String}
 */
module.exports.getValidWordString = function() {
	let str;

	str = '##Valid words\n';
	for (const key in validWord) {
		if (validWord.hasOwnProperty(key) && key != 'NONE') {
			str += key + ' : ' + validWord[key] + '\n';
		}
	}
	return str;
};

/**
 * Return TRUE if arg is a valid word
 *
 * @param {*} arg a string representing a valid word
 * @returns {Boolean}
 */
function isValidWord(arg) {
	if (validWord[arg] != undefined) {
		return (true);
	}
	return (false);

}

/**
 *	Fill values according to the word arg
 *
 * @param {*} arg a string representing a valid word
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 */
function populateByWord(arg, values) {
	values.numberOfRoll = 1;
	values.diceRange = validWord[arg];
}

/**
 *	Return FALSE if str is empty
 *
 * @param {*} str the string to check
 * @returns {Boolean}
 */
function notEmpty(str) {
	return str != '';
}

/**
 *	Return TRUE if str contain only numeric characters
 *
 * @param {*} str the string to check
 * @returns {Boolean}
 */
function isNumeric(str) {
	return str.match(/^[0-9]+$/i) !== null;
}

/**
 * Fill the proper value in the modifier value.
 * and return the unused part of the string
 *
 * @param {String} arg the string to be parsed
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 * @param {Message} msg the message to send error to
 * @returns {String}
 */
function populateModifierValue(arg, values, msg) {
	// Get modifier : +/-<NOMBRE>
	let argSplt = arg.split(/[+]/).filter(notEmpty);
	if (argSplt.length == 2
      && isNumeric(argSplt[1])) {
		values.modifier = parseInt(argSplt[1], 10);
	} else if (argSplt.length >= 2) {
		BtmErr.replyError('INVALID_ARGUMENT', msg, arg);
		values.response = '';
		return [];
	} else {
		argSplt = arg.split(/[-]/).filter(notEmpty);
		if (argSplt.length == 2 && isNumeric(argSplt[1])) {
			values.modifier = 0 - parseInt(argSplt[1], 10);
		} else if (argSplt.length >= 2) {
			BtmErr.replyError('INVALID_ARGUMENT', msg, arg);
			values.response = '';
			return [];
		}
	}
	return argSplt;
}

/**
 * Fill the dice_number value.
 * and return the unused part of the string
 *
 * @param {String} arg the string to be parsed
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 * @param {Message} msg the message to send error to
 * @returns {String[]}
 */
function populateDiceNumber(arg, values, msg) {
	// Identify the number of roll
	const argSplt2 = arg.split(/[Dd]/);
	if (argSplt2.length > 2) {
		BtmErr.replyError('INVALID_ARGUMENT', msg, values.arg);
		values.response = '';
		return [];
	} else if (argSplt2.length == 2
      && Number.isInteger(parseInt(argSplt2[0], 10))
      && parseInt(argSplt2[0], 10) > 0) {
		values.numberOfRoll = parseInt(argSplt2[0], 10);
	} else if (argSplt2.length == 1
      || argSplt2.length == 2 && argSplt2[0] === '') {
		values.numberOfRoll = 1;
	} else {
		BtmErr.replyError('NAN_DICE_NBR', msg, argSplt2[0]);
		values.response = '';
		return [];
	}
	return argSplt2;
}

/**
 *	Fill the dice range value
 *
 * @param {String[]} arg the tab of string to be parsed
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 * @param {Message} msg the message to send error to
 */ 
function populateDiceRange(argSplt, values, msg) {
// Identify the dice range
	if (argSplt.length > 2) {
		BtmErr.replyError('INVALID_ARGUMENT', msg, values.arg);
		values.response = '';
		return;
	} else if (argSplt.length == 2
        && Number.isInteger(parseInt(argSplt[1]), 10)
        && parseInt(argSplt[1], 10) > 0) {
		values.diceRange = parseInt(argSplt[1], 10);
	} else if (Number.isInteger(parseInt(argSplt[0], 10))
    && parseInt(argSplt[0], 10) > 0) {
		values.diceRange = parseInt(argSplt[0], 10);
	} else {
		if (argSplt[0] === '') {
			BtmErr.replyError('INVALID_ARGUMENT', msg, values.arg);
		} else {
			BtmErr.replyError('NAN_DICE_RANGE', msg, argSplt[0]);
		}
		values.response = '';
		return;
	}
}

/**
 * Fill all the required values.
 *
 * @param {String} arg the string to be parsed
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 * @param {Message} msg the message to send error to
 */
function populateDiceValues(arg, values, msg) {
	if (arg == undefined) {
		values.numberOfRoll = 1;
		values.diceRange = 100;
	} else {
		if (isValidWord(arg)) {
			populateByWord(arg, values);
		} else {
			let argSplit = populateModifierValue(arg, values, msg);
			if (argSplit.length > 0) {
				argSplit = populateDiceNumber(argSplit[0], values, msg);
				if (argSplit.length > 0) {
					populateDiceRange(argSplit, values, msg);
				}
			}
		}
	}
}

/**
 * Create the string with the values of the roll
 *
 * @param {*} values the structure containing all the values :
 * (response, numberOfRoll, diceRange, modifier)
 */
function createResponse(values) {
	let result = 0;
	let tmp = 0;
	values.response = '';
	if (values.numberOfRoll > 1) {
		values.response = '(';
		for (var i=0; i < values.numberOfRoll - 1; i++) {
			tmp = Math.floor(Math.random() * Math.floor(values.diceRange)) + 1;
			result += tmp;
			values.response += tmp + ' + ';
		}
		tmp = Math.floor(Math.random() * Math.floor(values.diceRange)) + 1;
		result += tmp;
		values.response += tmp + ')';
	} else {
		tmp = Math.floor(Math.random() * Math.floor(values.diceRange)) + 1;
		result += tmp;
		values.response += tmp;
	}
	values.response += ' *[/ ' + values.diceRange + ']*';
	if (values.modifier != 0) {
		result += values.modifier;
		values.response += (values.modifier > 0) ? ' + ' : ' - ';
		values.response += Math.abs(parseInt(values.modifier, 10));
	}
	if (values.modifier != 0 || values.numberOfRoll > 1) {
		values.response += ' = ' + result;
	}
}

/**
   * Create the string response of an roll argument.
   *
   * @param {String} arg an argument to be parsed
   * @param {Message} msg a message to reply in case of error
   * @returns {String}
   */

module.exports.getRoll = function(arg, msg) {
	const values = {
		response: 'ready',
		modifier: 0,
		numberOfRoll: 0,
		diceRange: 0,
	};
	populateDiceValues(arg, values, msg);
	if (values.response === 'ready'
    && values.numberOfRoll > 0 && values.diceRange > 0) {
		createResponse(values);
	}
	return (values.response);
};
