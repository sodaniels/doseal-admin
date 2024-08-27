const moment = require("moment");

class StringFunctions {
	split_name(name) {
		name = name.trim();
		let last_name =
			name.indexOf(" ") === -1 ? "" : name.replace(/.*\s([\w-]*)$/, "$1");
		let first_name = name
			.replace(
				new RegExp(last_name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"),
				""
			)
			.trim();

		if (last_name.length < 2) {
			last_name = first_name;
		}

		return [first_name, last_name];
	}

	formatDate(date, old_format = "Y-m-d H:i:s.u", new_format = "d-m-Y") {
		let formattedDate;
		if (old_format === null) {
			formattedDate = moment(date);
		} else {
			formattedDate = moment(date, old_format);
		}
		return formattedDate.format(new_format);
	}
}

module.exports = StringFunctions;
