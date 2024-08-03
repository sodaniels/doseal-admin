const axios = require("axios");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const customData = require('../../helpers/shortData');
const { Hash } = require('../../helpers/hash');
const Person = require('../../models/person.model');
const Admin = require('../../models/admin.model');
const Region = require('../../models/region.model');
const Permission = require('../../models/permission');
const { Log } = require("../../helpers/Log");


async function listPerson(req, res) {
    const users = await Person.find({});
    try {

        if (users) {
            return res.status(200).render("admin/persons/list", {
                pageTitle: 'List Persons',
                path: '/persons',
                errors: false,
                errorMessage: false,
                successMessage: false,
                users: users,
                csrfToken: req.csrfToken(),
                shortData: customData.shortData
            });
        }

        return res.status(422).render("admin/persons/list", {
            pageTitle: 'List Persons',
            path: '/persons',
            errors: false,
            errorMessage: false,
            successMessage: true,
            users: users,
            csrfToken: req.csrfToken(),
            shortData: customData.shortData
        });
    } catch (error) {
        res.render('admin/persons/list', {
            pageTitle: 'List Persons',
            path: '/persons',
            errors: false,
            errorMessage: error,
            users: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: customData.shortData
        });
    }
}

async function getAddPerson(req, res) {
    const regions = await Region.find({}).sort({ _id: -1 });
    res.render('admin/persons/add', {
        pageTitle: 'Add User',
        path: '/person/add',
        errors: false,
        role: false,
        user: false,
        region: false,
        regions: regions,
        driver: false,
        userInput: false,
        admin: req.session.user,
        errorMessage: false,
        successMessage: false,
        transformWord: customData.transformWord,
        csrfToken: req.csrfToken()
    });
}

async function postAddPerson(req, res) {
    const errors = validationResult(req);
    let selectRegion = req.body.region;
    const requestBody = req.body;
    const regions = await Region.find({}).sort({ _id: -1 });

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/persons/add", {
            pageTitle: "Add Person",
            path: "/person/add",
            region: selectRegion,
            regions: regions,
            user: false,
            admin: req.session.user,
            errors: errors.array(),
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken(),
            userInput: requestBody,
        });
    }

    try {

        const passwd = await Hash(req.body.password);
        const userId = uuidv4();
        const admin = req.session.user;


        const newPerson = new Person({
            userId: userId,
            adminId: admin.userId,
            category: req.body.category,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            region: selectRegion,
            idType: req.body.idType,
            idNumber: req.body.idNumber,
            idExpiryDate: req.body.idExpiryDate,
            email: req.body.email,
            password: passwd,
            createdBy: admin._id
        });

        const savedPerson = await newPerson.save();

        if (savedPerson) {
            return res.status(200).render("admin/persons/add", {
                pageTitle: "Add Person",
                path: "/person/add",
                errors: false,
                user: false,
                region: selectRegion,
                regions: regions,
                admin: req.session.user,
                userInput: false,
                errorMessage: false,
                successMessage: "User added successfully",
                transformWord: customData.transformWord,
                csrfToken: req.csrfToken(),
            });
        }

        return res.status(422).render("admin/persons/add", {
            pageTitle: "Add Person",
            path: "/person/add",
            errors: errors.array(),
            region: selectRegion,
            regions: regions,
            user: false,
            admin: req.session.user,
            userInput: requestBody,
            errorMessage: false,
            successMessage: false,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        return res.status(422).render("admin/persons/add", {
            pageTitle: "Add Person",
            path: "/person/add",
            errors: errors.array(),
            region: selectRegion,
            regions: regions,
            user: false,
            userInput: requestBody,
            admin: req.session.user,
            errorMessage: error,
            successMessage: true,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken(),
        });
    }
}

async function getEditPerson(req, res) {
    const user = await Person.findOne({ userId: req.params.userId });
    const regions = await Region.find({}).sort({ _id: -1 });
    if (user) {
        const selectRegion = user.region;
        const userRole = user.role;
        res.render('admin/persons/add', {
            pageTitle: 'Edit Person',
            path: `/driver/edit/${req.query.userId}`,
            user: user,
            role: userRole ? userRole : false,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            regions: regions,
            region: selectRegion,
            successMessage: false,
            userInput: false,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken(),
        });
    } else {
        res.render('admin/drivers/add', {
            pageTitle: 'Edit Person',
            path: `/driver/add`,
            user: false,
            role: false,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            region: false,
            regions: regions,
            successMessage: false,
            userInput: false,
            transformWord: customData.transformWord,
            csrfToken: req.csrfToken(),
        });
    }


}

async function putEditPerson(req, res) {
    let selectRegion = req.body.region;
    let selectCategory = req.body.category;
    const requestBody = req.body;
    const regions = await Region.find({}).sort({ _id: -1 });
    const user = await Person.findOne({ userId: req.params.userId });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/persons/add", {
            pageTitle: "Edit Person",
            path: `/driver/edit/${req.query.userId}`,
            user: user,
            region: false,
            category: selectCategory,
            admin: req.session.user,
            errors: false,
            errorMessage: false,
            regions: regions,
            userInput: requestBody,
            transformWord: customData.transformWord,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {

        const updatedPersonData = {
            category: req.body.category,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            region: selectRegion,
            email: req.body.email,
            idType: req.body.idType,
            idNumber: req.body.idNumber,
            idExpiryDate: req.body.idExpiryDate,
        };

        Person.findOne({ userId: req.params.userId })
            .then((user) => {
                if (user) {
                    // Update the driver with the new data
                    Object.assign(user, updatedPersonData);
                    // Save the changes to the database
                    return user.save();
                } else {
                    // Handle the case where the customer with the specified ID is not found
                    return res.status(422).render("admin/persons/add", {
                        pageTitle: "Edit Person",
                        path: `/driver/edit/${req.query.userId}`,
                        errors: false,
                        region: selectRegion,
                        category: selectCategory,
                        admin: req.session.user,
                        regions: regions,
                        userInput: requestBody,
                        transformWord: customData.transformWord,
                        user: user,
                        errorMessage: 'User not found',
                        successMessage: false,
                        csrfToken: req.csrfToken(),
                    });
                }
            })
            .then((updatedUser) => {
                // Handle the case where the update was successful
                Log.info(`[PersonController.js][PersonController][${req.query.userId}]User updated successfully:` + JSON.stringify(updatedUser));
                return res.status(422).render("admin/persons/add", {
                    pageTitle: "Edit Person",
                    path: `/driver/edit/${req.query.userId}`,
                    errors: false,
                    region: updatedUser.region,
                    admin: req.session.user,
                    regions: regions,
                    category: selectCategory,
                    userInput: requestBody,
                    transformWord: customData.transformWord,
                    user: updatedUser,
                    errorMessage: false,
                    successMessage: 'User updated successfully',
                    csrfToken: req.csrfToken(),
                });
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating user:', error.message);
                return res.status(422).render("admin/persons/add", {
                    pageTitle: "Edit Person",
                    path: `/driver/edit/${req.query.userId}`,
                    errors: false,
                    region: false,
                    category: selectCategory,
                    admin: req.session.user,
                    userInput: requestBody,
                    regions: regions,
                    transformWord: customData.transformWord,
                    user: user,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                });
            });

    } catch (error) {
        return res.status(422).render("admin/persons/add", {
            pageTitle: "Edit Person",
            path: `/driver/edit/${req.query.userId}`,
            errors: false,
            region: false,
            category: selectCategory,
            admin: req.session.user,
            regions: regions,
            userInput: requestBody,
            transformWord: customData.transformWord,
            user: user,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }
}

async function postDeletePerson(req, res) {
    const driver = await Person.findOneAndDelete({ userId: req.params.userId });

    if (driver) {
        const users = await Person.find({}).sort({ _id: -1 });
        return res.status(200).render("admin/drivers/list", {
            pageTitle: "List Persons",
            path: "/drivers",
            errors: false,
            errorMessage: false,
            successMessage: "Person deleted successfully",
            users: users,
            csrfToken: req.csrfToken(),
            shortData: customData.shortData
        });
    }
    const users = await Person.find({}).sort({ _id: -1 });
    return res.status(200).render("admin/drivers/list", {
        pageTitle: "List Persons",
        path: "/drivers",
        errors: false,
        errorMessage: "Error in deleting driver",
        successMessage: false,
        users: users,
        csrfToken: req.csrfToken(),
        shortData: customData.shortData
    });


}

module.exports = {
    getAddPerson,
    postAddPerson,
    listPerson,
    getEditPerson,
    putEditPerson,
    postDeletePerson,
};
