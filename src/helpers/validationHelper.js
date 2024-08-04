const { validationResult } = require("express-validator");

// Function to handle validation errors and format the response
const handleValidationErrors = (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const formattedErrors = errors.array().map((error) => {
			return {
				type: "validation",
				message: error.msg,
				field: error.path,
			};
		});
		return formattedErrors;
	}
	return false;
};

module.exports = { handleValidationErrors };
