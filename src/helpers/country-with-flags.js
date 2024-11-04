const countries = require("i18n-iso-countries");
const {
	getCountryCallingCode,
	parsePhoneNumberFromString,
	isValidPhoneNumber,
} = require("libphonenumber-js");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

// Helper function to get the flag emoji from the country code
function getFlagEmoji(countryCode) {
	return countryCode
		.toUpperCase()
		.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

// Retrieve countries with codes and flags
const getCountriesWithFlags = () => {
	const countryCodes = countries.getAlpha2Codes();
	return Object.entries(countryCodes)
		.map(([code, name]) => {
			try {
				return {
					name: countries.getName(code, "en"),
					code: `+${getCountryCallingCode(code)}`, // Get calling code
					flag: getFlagEmoji(code),
				};
			} catch (error) {
				return null; // Handle any cases where a calling code may not exist
			}
		})
		.filter(Boolean); // Remove null entries if any
};

function validatePhoneNumber(countryCode, phoneNumber) {
    // Combine the country code and phone number
    const fullNumber = `${countryCode}${phoneNumber}`;
    
    // Parse the phone number
    const phoneNumberObj = parsePhoneNumberFromString(fullNumber);

    // Check if the phone number is valid
    if (!phoneNumberObj || !isValidPhoneNumber(fullNumber)) {
        return {
            valid: false,
            message: 'Invalid phone number.'
        };
    }

    return {
        valid: true,
        message: 'Valid phone number.',
        country: phoneNumberObj.country, // Get country info
        format: phoneNumberObj.formatInternational().replace(/\s+/g, '')
    };
}

module.exports = {
	getCountriesWithFlags,
    validatePhoneNumber,
};
