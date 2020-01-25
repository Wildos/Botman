function get_dice_result(string) {
	let result_nb = 0;
	let result_text = '(';

	if (String(string).includes('d')) {
		let parts = string.split('d');
		if (parts.length != 2){
			return [0, 'Wtf is this?'];
		}
		else {
			let number_of_roll = Number(parts[0]);
			let number_of_range = Number(parts[1]);

			let nbr = Math.floor(Math.random() * Math.floor(number_of_range)) + 1;
			result_text += String(nbr);
			result_nb += nbr;
			for (let i = 1; i < number_of_roll; i += 1) {
				nbr = Math.floor(Math.random() * Math.floor(number_of_range)) + 1;
				result_text += ' + ' + String(nbr);
				result_nb += nbr;
			}
			result_text += ') [/'+ String(number_of_range) +']';

		}
		return [Number(result_nb), String(result_text)];
	}
	else
		return [Number(string), String(string)];
}


function split_dice_roll(string, mod) {
	let results = [];
	let parts = string.split(mod);
	parts.forEach(element => {
		results.push(get_result(element));
	});
	return results;
}

function fusion_results(results, mod) {
	let result_nb = 0;
	let result_text = '';

	if (results.length > 1) {
		let result = results[0];
		result_nb += (mod === '+') ? Number(result[0]) : -Number(result[0]);
		result_text += String(result[1]);

		for (var i = 1, len = results.length; i < len; i++) {
			let result = results[i];
			result_nb += (mod === '+') ? Number(result[0]) : -Number(result[0]);
			result_text += ' ' + mod + ' ' + String(result[1]);
		}
	}
	else {
		result_nb = results[0][0];
		result_text = results[0][1];
	}
	return [result_nb, result_text];
}

function get_result(args) {
	let results = [];
	let mod = '';

	// split and get result
	if (Array.isArray(args)) { // If array relaunch on all arguments
		args.forEach(element => {
			results.push(get_result(element));
		});
		mod = '+';
	}
	else {
		let string = String(args);
		if (string.includes('+')) {
			mod = '+';
			results = split_dice_roll(string, mod);
		} else if (string.includes('-')) {
			mod = '-';
			results = split_dice_roll(string, mod);
		}else {
			return get_dice_result(string);
		}
	}
	// fusion results
	return fusion_results(results, mod);
}


// TODO make check of parameters
module.exports.roll_command = function(origin, args) {
	if (args.length == 0) {
		args = ['1d20'];
	}
	let result = get_result(args);
	let message = result[1] + ' = ' + result[0];
	console.log('replied '+ origin.author.username +' : ' + message);
	origin.reply(message);
};

module.exports.gmroll_command = function(origin, args) {
	if (args.length == 0) {
		args = ['1d20'];
	}
	let result = get_result(args);
	let message = result[1] + ' = ' + result[0];
	console.log('replied '+ origin.author.username +' : ' + message);
	
	var gm = origin.client.users.find(x => x.id === process.env.ACTUAL_GM);
	gm.send(origin.author.username + ' rolled ' + message);
	origin.reply('roll sent to the GM: ' + gm.username);
};
