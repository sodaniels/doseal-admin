const ServiceCode = {
	INTERNAL_ERROR: "INTERNAL_ERROR",
	SUCCESS: "SUCCESS",
	FAILED: "FAILED",
	NO_DATA_FOUND: "NO_DATA_FOUND",
	ALREADY_EXISTS: "ALREADY_EXISTS",
	ACCOUNT_BALANCE_EXCEEDED: "ACCOUNT_BALANCE_EXCEEDED",
	ACCOUNT_WALLET_IN_PROGRESS: "ACCOUNT_WALLET_IN_PROGRESS",
	ACCOUNT_CREATED: "ACCOUNT_CREATED",
	NOT_FOUND: "NOT_FOUND",

	INTERNAL_ERROR: "INTERNAL_ERROR",
	ERROR_OCCURED: "ERROR_OCCURED",
	DUPLICATE_ERROR: "DUPLICATE_ERROR",
	NO_FUNDS: "NO_FUNDS",
	ALLOWD_IPS: ["127.0.0.1", "::1", "198.199.83.148"],
	ALLOWED_UAT_DEVICES: [
		{
			name: "barbados",
			devices: [
				"A44CC99E-A0C0-418F-820B-BD12C8BDDB5C-",
				"00008020-001639A22E69002E",
			],
		},
	],

	SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
	AMOUNT_LIMIT_ALLOWED: "AMOUNT_LIMIT_ALLOWED",
	TRANSACTION_VALIDATED: "TRANSACTION_VALIDATED",
	TRANSACTION_VALIDATION_FAILED: "TRANSACTION_VALIDATION_FAILED",
	TRANSACTION_EXECUTION_FAILED: "TRANSACTION_EXECUTION_FAILED",
	TRANSACTION_LIMIT_EXCEEDED: "TRANSACTION_LIMIT_EXCEEDED",

};

module.exports = ServiceCode;
