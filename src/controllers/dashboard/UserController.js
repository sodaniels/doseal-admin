const axios = require("axios");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const customData = require("../../helpers/shortData");
const { Hash } = require("../../helpers/hash");
const User = require("../../models/user");
const Admin = require("../../models/admin.model");
const Permission = require("../../models/permission");
const { Log } = require("../../helpers/Log");
const Helpers = require('../../helpers/helper');
const helpers = new Helpers();

async function listUsers(req, res) {
	const users = await Admin.find({ role: { $ne: "Subscriber" } });
	const admin = req.session.admin;

	try {
		if (users) {
			return res.status(200).render("backend/users/manage", {
				pageTitle: "Manage Users",
				path: "/users",
				errors: false,
				errorMessage: false,
				successMessage: false,
                userInput: false,
				users: users,
				user: false,
                admin: admin,
				csrfToken: req.csrfToken(),
				shortData: customData.shortData,
                getInitials: helpers.getInitials
			});
		}

		return res.status(422).render("backend/users/manage", {
			pageTitle: "Manage Users",
			path: "/users",
			errors: false,
			errorMessage: false,
			successMessage: true,
            userInput: false,
            user: false,
			users: users,
            admin: admin,
			csrfToken: req.csrfToken(),
			shortData: customData.shortData,
            getInitials: helpers.getInitials
		});
	} catch (error) {
		return res.status(200).render("backend/users/manage", {
			pageTitle: "Manage Users",
			path: "/users",
			errors: false,
			errorMessage: error,
            userInput: false,
			users: false,
            user: false,
            admin: admin,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: customData.shortData,
            getInitials: helpers.getInitials
		});
	}
}

async function getAddUser(req, res) {
	const permissions = await Permission.find({});
	const admin = req.session.admin;

	res.render("backend/users/add", {
		pageTitle: "Add User",
		path: "/users/add",
		errors: false,
		role: false,
		user: false,
		userInput: false,
		permissions: permissions,
		admin: admin,
		errorMessage: false,
		successMessage: false,
		transformWord: customData.transformWord,
		csrfToken: req.csrfToken(),
	});
}

async function postAddUser(req, res) {
    const users = await Admin.find({ role: { $ne: "Subscriber" } });
	const permissions = await Permission.find({});
	const errors = validationResult(req);
	let selectRole = req.body.role;
    const requestBody = req.body;
	const admin = req.session.admin;

	if (!errors.isEmpty()) {
        return res.status(400).render("backend/users/manage", {
            pageTitle: "Manage Users",
            path: "/users",
			role: selectRole,
			users: users,
			user: false,
			admin: admin,
			permissions: permissions,
            userInput: requestBody,
			errors: errors.array(),
			errorMessage: false,
			iUser: false,
			successMessage: false,
			transformWord: customData.transformWord,
            getInitials: helpers.getInitials,
            shortData: customData.shortData,
			csrfToken: req.csrfToken(),
		});
	}

	try {
		const passwd = await Hash(req.body.password);
		const userId = uuidv4();

		const newUser = new Admin({
			userId: userId,
			adminId: req.body.adminId,
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			phoneNumber: req.body.phoneNumber,
			role: selectRole,
			email: req.body.email,
			password: passwd,
			permissions: req.body.permissions,
		});

		const savedCustomer = await newUser.save();

		if (savedCustomer) {
            const users = await Admin.find({ role: { $ne: "Subscriber" } });
            return res.status(200).render("backend/users/manage", {
				pageTitle: "Manage Users",
				path: "/users",
				errors: false,
                users: users,
				user: false,
				permissions: permissions,
				role: selectRole,
				admin: admin,
                userInput: requestBody,
				customer: false,
				errorMessage: false,
				successMessage: "User added successfully",
				transformWord: customData.transformWord,
                getInitials: helpers.getInitials,
                shortData: customData.shortData,
				csrfToken: req.csrfToken(),
			});
		}

        return res.status(422).render("backend/users/manage", {
            pageTitle: "Manage Users",
            path: "/users",
			errors: errors.array(),
			role: selectRole,
            users: users,
			user: false,
			admin: admin,
			permissions: permissions,
            userInput: requestBody,
			admin: req.session.user,
			customer: false,
			errorMessage: false,
			successMessage: false,
			transformWord: customData.transformWord,
            shortData: customData.shortData,
            getInitials: helpers.getInitials,
			csrfToken: req.csrfToken(),
		});
	} catch (error) {
        return res.status(422).render("backend/users/manage", {
            pageTitle: "Manage Users",
            path: "/users",
			errors: errors.array(),
			role: selectRole,
            users: users,
			user: false,
			admin: admin,
			permissions: permissions,
            userInput: requestBody,
			admin: req.session.user,
			customer: false,
			errorMessage: error,
			successMessage: true,
			transformWord: customData.transformWord,
            shortData: customData.shortData,
            getInitials: helpers.getInitials,
			csrfToken: req.csrfToken(),
		});
	}
}

async function getEditUser(req, res) {
    const users = await Admin.find({ role: { $ne: "Subscriber" } });
	const user = await Admin.findOne({ _id: req.params.userId });
	const permissions = await Permission.find({});
	const admin = req.session.admin;


	
	if (user) {
		const userRole = user.role;
		return res.status(200).render("backend/users/add", {
            pageTitle: "Manage Users",
            path: "/users",
            users: users,
			user: user,
            userInput: false,
			role: userRole ? userRole : false,
			admin: admin,
			errors: false,
			errorMessage: false,
			permissions: permissions,
			successMessage: false,
			transformWord: customData.transformWord,
            shortData: customData.shortData,
            getInitials: helpers.getInitials,
			csrfToken: req.csrfToken(),
		});
	} else {
		return res.status(200).render("backend/users/add", {
            pageTitle: "Manage Users",
            path: "/users",
            users: users,
			user: false,
            userInput: false,
			role: false,
			admin: admin,
			errors: false,
			errorMessage: false,
			permissions: permissions,
			successMessage: false,
			transformWord: customData.transformWord,
            shortData: customData.shortData,
            getInitials: helpers.getInitials,
			csrfToken: req.csrfToken(),
		});
	}
}

async function putEditUser(req, res) {
	let selectRole = req.body.role;
	const permissions = await Permission.find({});
	const user = await Admin.findOne({ userId: req.params.userId });
	const errors = validationResult(req);
	const admin = req.session.admin;

	console.log(errors.array());
	if (!errors.isEmpty()) {
		return res.status(422).render("admin/users/add", {
			pageTitle: "Edit User",
			path: `/users/edit/${req.query.userId}`,
			user: user,
			role: false,
			admin: admin,
			errors: false,
			errorMessage: false,
			permissions: permissions,
			transformWord: customData.transformWord,
			successMessage: false,
			csrfToken: req.csrfToken(),
		});
	}

	try {
		const updatedCustomerData = {
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			phoneNumber: req.body.phoneNumber,
			role: selectRole,
			email: req.body.email,
			permissions: req.body.permissions
		};

		Admin.findOne({ userId: req.params.userId })
			.then((user) => {
				if (user) {
					// Update the customer with the new data
					Object.assign(user, updatedCustomerData);
					// Save the changes to the database
					return user.save();
				} else {
					// Handle the case where the customer with the specified ID is not found
					return res.status(422).render("admin/users/add", {
						pageTitle: "Edit users",
						path: `/users/edit/${req.query.userId}`,
						errors: false,
						role: selectRole,
						admin: req.session.user,
						permissions: permissions,
						transformWord: customData.transformWord,
						user: user,
						admin: admin,
						errorMessage: "User not found",
						successMessage: false,
						csrfToken: req.csrfToken(),
					});
				}
			})
			.then((updatedUser) => {
				// Handle the case where the update was successful
				console.log("User updated successfully:", updatedUser);
				return res.status(422).render("admin/users/add", {
					pageTitle: "Edit User",
					path: `/user/edit/${req.query.userId}`,
					errors: false,
					role: updatedUser.role,
					admin: admin,
					permissions: permissions,
					transformWord: customData.transformWord,
					user: updatedUser,
					errorMessage: false,
					successMessage: "User updated successfully",
					csrfToken: req.csrfToken(),
				});
			})
			.catch((error) => {
				// Handle any errors that occurred during the update process
				console.error("Error updating user:", error.message);
				return res.status(422).render("admin/users/add", {
					pageTitle: "Edit User",
					path: `/users/edit/${req.query.userId}`,
					errors: false,
					role: false,
					admin: admin,
					permissions: permissions,
					transformWord: customData.transformWord,
					user: user,
					errorMessage: error,
					successMessage: false,
					csrfToken: req.csrfToken(),
				});
			});
	} catch (error) {
		return res.status(422).render("dashboard/users/add", {
			pageTitle: "Edit User",
			path: `/users/edit/${req.query.userId}`,
			errors: false,
			role: false,
			admin: admin,
			permissions: permissions,
			transformWord: customData.transformWord,
			user: user,
			errorMessage: error,
			successMessage: false,
			csrfToken: req.csrfToken(),
		});
	}
}

// remove later

async function listUsers1(req, res) {
	const users = await User.find({ role: { $ne: "superuser" } });
	const admin = req.session.admin;

	try {
		if (users) {
			return res.status(200).render("dashboard/users/list-users", {
				pageTitle: "List Users",
				path: "/users",
				errors: false,
				errorMessage: false,
				successMessage: false,
				users: users,
				admin: admin,
				csrfToken: req.csrfToken(),
				shortData: customData.shortData,
			});
		}

		return res.status(422).render("dashboard/users/list-user", {
			pageTitle: "List Users",
			path: "/users",
			errors: false,
			admin: admin,
			errorMessage: false,
			successMessage: true,
			users: users,
			csrfToken: req.csrfToken(),
			shortData: customData.shortData,
		});
	} catch (error) {
		res.render("dashboard/users/list-user", {
			pageTitle: "List Users",
			path: "/users",
			errors: false,
			admin: admin,
			errorMessage: error,
			users: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: customData.shortData,
		});
	}
}

module.exports = {
	getAddUser,
	postAddUser,
	listUsers,
	getEditUser,
	putEditUser,

	listUsers1,
};
