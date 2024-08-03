const User = require("../models/user");
const { body } = require("express-validator");
const { parseISO, isPast } = require('date-fns');
const { validateLatLngFormat } = require('../Middleware/validation');


const idExpiryDateValidator = (value) => {
	const date = parseISO(value); // Parse the date string into a Date object
	const currentDate = new Date(); // Get the current date
	if (isPast(date)) {
		throw new Error('ID expiry date must not be in the past.');
	}
	return true;
};

const validateLogin = [
	body("email")
		.notEmpty()
		.withMessage("The email is required")
		.isEmail()
		.withMessage("Enter a valid email address")
		.trim()
		.escape(),
	body("password")
		.notEmpty()
		.withMessage("The password is required")
];

const validateCustomer = [
	body('businessName').notEmpty().withMessage('businessName is required.'),
	// body('businessLogo').optional().notEmpty().withMessage('businessLogo must be a non-empty string.'),
	body('physicalLocation').optional().notEmpty().withMessage('physicalLocation must be a non-empty string.'),
	body('email').isEmail().withMessage('Invalid email address.'),
	body('phoneNumber').notEmpty().withMessage('phoneNumber is required.'),
];

const validateUser = [
	body('firstName').notEmpty().withMessage('First name is required').isString().withMessage('First name must be a string'),
	body('middleName').optional().isString().withMessage('Middle name must be a string'),
	body('lastName').notEmpty().withMessage('Last name is required').isString().withMessage('Last name must be a string'),
	body('role').notEmpty().withMessage('Role is required').isString().withMessage('Role must be a string'),
	body('email').notEmpty().isEmail().withMessage('Invalid email address'),
	body('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
	body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Passwords do not match');
		}
		return true;
	})
];

const validateOnboarding = [
	body('firstName').notEmpty().withMessage('First name is required').isString().withMessage('First name must be a string'),
	body('middleName').optional().isString().withMessage('Middle name must be a string'),
	body('lastName').notEmpty().withMessage('Last name is required').isString().withMessage('Last name must be a string'),
	body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
	body('email').optional().isEmail().withMessage('Invalid email address'),
	body('region').optional().isString().withMessage('Region name must be a string'),
	body('location').notEmpty().withMessage('Location is required'),
	body('idExpiryDate')
		.optional()
		.custom(idExpiryDateValidator)
		.withMessage('ID expiry date must not be in the past.')
];

const validateBusinessOnboarding = [
	body('businessName').notEmpty().withMessage('Business name is required').isString().withMessage('Business name must be a string'),
	body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
	body('email').notEmpty().isEmail().withMessage('Invalid email address'),
	body('paymentMode').notEmpty().withMessage('paymentMode is required'),
	body('city').optional().isString().withMessage('City name must be a string'),
	body('region').optional().isString().withMessage('Region name must be a string'),
	body('location').notEmpty().withMessage('Location is required'),
	body('c1_fullname').notEmpty().isString().withMessage('Enter contact person  1\'s  fullname'),
	body('c1_phoneNumber').notEmpty().withMessage('Enter contact person 1\'s phone number'),
	body('c2_fullname').notEmpty().isString().withMessage('Enter contact person  2\'s  fullname'),
	body('c2_phoneNumber').notEmpty().withMessage('Enter contact person 2\'s phone number'),
];

const validateDustbin = [
	body('hiddenLocation').notEmpty().withMessage('Location is required'),
	body('city').isString().notEmpty().withMessage('City must be a non-empty string'),
	body('region').isString().notEmpty().withMessage('Region must be a non-empty string'),
	body('landmark').isString().notEmpty().withMessage('Closest Landmark must be a non-empty string'),
];

const validateDistrict = [
	body('region').isArray().notEmpty().withMessage('Please select a region'),
	body('name').isArray().notEmpty().withMessage('District name must be a non-empty string')
];
const validateAssembly = [
	body('district').isArray().notEmpty().withMessage('Please select a district'),
	body('name').isArray().notEmpty().withMessage('Assemby name must be a non-empty string')
];

const validatePostDistrict = [
	body('region').isString().notEmpty().withMessage('Please select a region'),
	body('name').isString().notEmpty().withMessage('District name must be a non-empty string')
];

const validatePostAssembly = [
	body('district').isString().notEmpty().withMessage('Please select a district'),
	body('name').isString().notEmpty().withMessage('Assembly name must be a non-empty string')
];


const validateDriver = [
	body('firstName').notEmpty().withMessage('First name is required').isString().withMessage('First name must be a string'),
	body('middleName').optional().isString().withMessage('Middle name must be a string'),
	body('lastName').notEmpty().withMessage('Last name is required').isString().withMessage('Last name must be a string'),
	body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
	body('email').notEmpty().isEmail().withMessage('Invalid email address'),
	body('region').optional().isString().withMessage('Region name must be a string'),
	body('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
	body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Passwords do not match');
		}
		return true;
	}),
	body('idExpiryDate')
		.optional()
		.custom(idExpiryDateValidator)
		.withMessage('ID expiry date must not be in the past.')
];

const validateVehicle = [
	body('name').trim().notEmpty().withMessage('Name is required'),
	body('carType').notEmpty().withMessage('Car Type is required'),
	body('status').notEmpty().withMessage('Status is required'),
	body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
	body('vehicleNumber').isLength({ min: 5, max: 20 }).withMessage('Vehicle number must be between 5 and 20 characters long'),
	body('fuelType').optional().notEmpty().withMessage('Fuel type is required'),
	body('ownership').optional().notEmpty().withMessage('Ownership type is required')
];

const validateAssigment = [
	body('supervisor').notEmpty().withMessage('Supervisor is required.'),
	body('startDate').optional({ nullable: true }).isISO8601().withMessage('Start date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('startTime').optional({ nullable: true }).isString().withMessage('Start time must be a string.'),
	body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('endTime').optional({ nullable: true }).isString().withMessage('End time must be a string.'),
	body('note').optional({ nullable: true }).trim(),
	// Custom validation for startDate less than endDate
	body().custom((value, { req }) => {
		const { startDate, startTime, endDate, endTime } = req.body;
		if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
			throw new Error('Start date must be less than end date.');
		}
		if (startDate && startTime && endDate && endTime && new Date(startDate + 'T' + startTime) >= new Date(endDate + 'T' + endTime)) {
			throw new Error('Start date/time must be less than end date/time.');
		}
		return true;
	}),
];

const validateTeam = [
	body('name').notEmpty().isString().withMessage('Job title is required.'),
	body('startDate').optional({ nullable: true }).isISO8601().withMessage('Start date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('startTime').optional({ nullable: true }).isString().withMessage('Start time must be a string.'),
	body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('endTime').optional({ nullable: true }).isString().withMessage('End time must be a string.'),
	body('supervisor').notEmpty().isString().withMessage('Select the supervisor.'),
	body('driver').notEmpty().isString().withMessage('Select the driver.'),
	// Custom validation for startDate less than endDate
	body().custom((value, { req }) => {
		const { startDate, startTime, endDate, endTime } = req.body;
		if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
			throw new Error('Start date must be less than end date.');
		}
		if (startDate && startTime && endDate && endTime && new Date(startDate + 'T' + startTime) >= new Date(endDate + 'T' + endTime)) {
			throw new Error('Start date/time must be less than end date/time.');
		}
		return true;
	}),
];

const validateSchedule = [
	body('title').notEmpty().isString().withMessage('Job title is required.'),
	body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('endDate').notEmpty().isISO8601().withMessage('End date must be a valid ISO 8601 date format (YYYY-MM-DD).'),
	body('frequency').notEmpty().isString().withMessage('End time must be a string.'),
	body('description').notEmpty().isString().withMessage('Description is required.'),
	body('location').notEmpty().isString().withMessage('Location is required.'),
];
const validateJob = [
	// body('jobs')
	// 	.isArray({ min: 1 })
	// 	.withMessage('Please select at least one job')
];






module.exports = {
	validateLogin,
	validateCustomer,
	validateUser,
	validateOnboarding,
	validateDustbin,
	validateDistrict,
	validateDriver,
	validateVehicle,
	validateAssigment,
	validatePostDistrict,
	validateAssembly,
	validatePostAssembly,
	validateBusinessOnboarding,
	validateTeam,
	validateSchedule,
	validateJob,
};
