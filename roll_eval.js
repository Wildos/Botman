const BtmErr = require('./btm_error_handler');

const validWord = {
  'NONE': -1,
  'easy': 75,
  'facile': 75,
  'basic': 100,
  'basique': 100,
  'medium': 130,
  'moyen': 130,
  'hard': 170,
  'difficile': 170,
  'risky': 200,
  'risque': 200,
  'risqué': 200,
  'danger': 300,
};

/**
 *
 *
 * @returns
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
 *
 *
 * @param {*} arg
 * @returns
 */
function isValidWord(arg) {
  if (validWord[arg] != undefined) {
    return (1);
  }
  return (0);
}

/**
 *
 *
 * @param {*} arg
 * @param {*} values
 * @param {*} msg
 */
function populateByWord(arg, values, msg) {
  values.numberOfRoll = 1;
  values.diceRange = validWord[arg];
}

/**
 *
 *
 * @param {*} str
 * @returns
 */
function notEmpty(str) {
  return str != '';
}

/**
 *
 *
 * @param {*} str
 * @returns
 */
function isNumeric(str) {
  return str.match(/^[0-9]+$/i) !== null;
}

/**
 * Fill the proper value in the modifier value.
 *
 * @param {String} arg
 * @param {*} values
 * @param {Message} msg
 * @returns
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
 *
 * @param {String[]} arg
 * @param {*} values
 * @param {Message} msg
 * @returns
 */
function populateDiceNumber(argSplt, values, msg) {
  // Identify the number of roll
  const argSplt2 = argSplt[0].split(/[Dd]/);
  if (argSplt2.length > 2) {
    BtmErr.replyError('INVALID_ARGUMENT', msg, values.arg);
    values.response = '';
    return [];
  } else if (argSplt2.length == 2
      && Number.isInteger(parseInt(argSplt2[0], 10))
      && parseInt(argSplt2[0], 10) > 0) {
    values.numberOfRoll = parseInt(argSplt2[0], 10);
  } else if (argSplt2.length == 1
      || argSplt2.length ==2 && argSplt2[0] === '') {
    values.numberOfRoll = 1;
  } else {
    BtmErr.replyError('NAN_DICE_NBR', msg, argSplt2[0]);
    values.response = '';
    return [];
  }
  return argSplt2;
}

/**
 *
 *
 * @param {String[]} arg
 * @param {*} values
 * @param {Message} msg
 * @returns
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
 * @param {String} arg
 * @param {*} values
 * @param {Message} msg
 */
function populateDiceValues(arg, values, msg) {
  if (arg == undefined) {
    values.numberOfRoll = 1;
    values.diceRange = 100;
  } else {
    if (isValidWord(arg)) {
      populateByWord(arg, values, msg);
    } else {
      let argSplit = populateModifierValue(arg, values, msg);
      if (argSplit.length > 0) {
        argSplit = populateDiceNumber(argSplit, values, msg);
        if (argSplit.length > 0) {
          populateDiceRange(argSplit, values, msg);
        }
      }
    }
  }
}

/**
 *
 *
 * @param {*} values
 */
function createResponse(values) {
  let result = 0;
  let tmp = 0;
  values.response = '';
  if (values.numberOfRoll > 1) {
    values.response = '(';
    for (i=0; i < values.numberOfRoll - 1; i++) {
      tmp = Math.floor(Math.random() * Math.floor(values.diceRange + 1));
      result += tmp;
      values.response += tmp + ' + ';
    }
    tmp = Math.floor(Math.random() * Math.floor(values.diceRange + 1));
    result += tmp;
    values.response += tmp + ')';
  } else {
    tmp = Math.floor(Math.random() * Math.floor(values.diceRange + 1));
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
   * @param {String} arg
   * @param {Message} msg
   * @returns
   */

module.exports.getRoll = function(arg, msg) {
  // let response = 'ready';
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
