/**
 * Maintains all error codes
 */
exports.errors = {
	// This is a catch all error
	// Ideally this should never be thrown
	UNKNOWN_ERROR: {
		code: 5000,
		message: "Unknown error !!!",
		hints: [
			"An error occurred. Please contact our technical team for more information.",
		],
		//info:"http://developer.myzeemoney.com/unknownerror"
	},

	DEVICE_ALREADY_EXISTS: {
		code: 409,
		message: "Device with the provided 'UUID' already exist",
		hints: "Ensure that the UUID is unique",
	},

	
	INVALID_CREDENTIALS: {
		code: 401,
		message: "Invalid credentials !!",
		hints: "Ensure you are entering a valid phone number and PIN combination",
	},
	USER_DOES_NOT_EXISTS: {
		code: 404,
		message: "User doesn’t exist !!",
		hints:
			"Ensure the phone number has already been registered before you try to login.",
	},
	/**LOGIN ENDS*/

	/**RESET PIN STARTS*/
	RECOVERY_INFORMATION_NOT_FOUND: {
		code: 404,
		message: "No recovery information was found",
		hints:
			"Prior to the user resetting their PINS, they must have first provided an alternative number or email.",
	},
	OTP_LIMIT_REACHED: {
		code: 401,
		message: "OTP limit reached",
		hints:
			"You have reached the maximum limit of OTP requests. Please wait for some time and try again.",
	},
	USER_NOT_FOUND: {
		code: 404,
		message: "User not found !!",
		hints:
			"We did not find a user with that phone number. Ensure the user is already registered in our system.",
	},
	RECOVERY_INFORMATION_NOT_FOUND: {
		code: 404,
		message: "No recovery information was found",
		hints:
			"Prior to the user resetting their PINS, they must have first provided an alternative number or email.",
	},
	WRONG_CODE: {
		code: 401,
		message: "Invalid OTP",
		hints: "Ensure that the two sets of OTPs are both correct !!",
	},
	

	/**REGISTRATION START */
	TRANSACTION_FAILED: {
		code: 400,
		message: "The transaction request failed",
	},
	/**REGISTRATION START */
};

/**
 * Utility methods
 * Creates the error response body to be sent back to the caller
 */
exports.create = async function (
	message,
	httpMethod,
	errorList,
	receivedPayload
) {
	return {
		// Meant for the developer
		text: message,
		timestamp: new Date(),
		// POST, GET ....
		method: httpMethod,
		// An array of all errors
		errors: errorList,
		// OPTIONAL - Use only during development
		payload: receivedPayload,
	};
};
