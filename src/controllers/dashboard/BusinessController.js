const axios = require("axios");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const customData = require('../../helpers/shortData');

const Business = require('../../models/business');



async function getAddBusiness(req, res) {
    res.render('dashboard/business/manage', {
        pageTitle: 'Add Business',
        path: '/business/add',
        errors: false,
        customer: false,
        errorMessage: false,
        successMessage: false,
        csrfToken: req.csrfToken(),
    });
}

async function getEditBusiness(req, res) {
    const business = await Business.findOne({ businessId: req.params.businessId });
    res.render('dashboard/business/manage', {
        pageTitle: 'Edit Business',
        path: `/business/edit/${req.query.businessId}`,
        customer: business,
        errors: false,
        errorMessage: false,
        successMessage: false,
        csrfToken: req.csrfToken(),
    });
}

async function putEditBusiness(req, res) {
    const customer = await Business.findOne({ businessId: req.params.businessId });
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(422).render("dashboard/business/manage", {
            pageTitle: "Edit Business",
            path: `/business/edit/${req.query.businessId}`,
            errors: errors.array(),
            errorMessage: false,
            customer: customer,
            successMessage: true,
            csrfToken: req.csrfToken(),
        });
    }

    try {

        const updatedCustomerData = {
            businessName: req.body.businessName,
            physicalLocation: req.body.physicalLocation,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        };

        Business.findOne({ businessId: req.params.businessId })
            .then((customer) => {
                if (customer) {
                    // Update the customer with the new data
                    Object.assign(customer, updatedCustomerData);
                    // Save the changes to the database
                    return customer.save();
                } else {
                    // Handle the case where the customer with the specified ID is not found
                    return res.status(422).render("dashboard/business/manage", {
                        pageTitle: "Edit Business",
                        path: `/business/edit/${req.query.businessId}`,
                        errors: false,
                        customer: customer,
                        errorMessage: 'Business not found',
                        successMessage: false,
                        csrfToken: req.csrfToken(),
                    });
                }
            })
            .then((updatedCustomer) => {
                // Handle the case where the update was successful
                console.log('Business updated successfully:', updatedCustomer);
                return res.status(422).render("dashboard/business/manage", {
                    pageTitle: "Edit Business",
                    path: `/business/edit/${req.query.businessId}`,
                    errors: false,
                    customer: updatedCustomer,
                    errorMessage: false,
                    successMessage: 'Business updated successfully',
                    csrfToken: req.csrfToken(),
                });
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                console.error('Error updating business:', error.message);
                return res.status(422).render("dashboard/business/manage", {
                    pageTitle: "Edit Business",
                    path: `/business/edit/${req.query.businessId}`,
                    errors: false,
                    customer: customer,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                });
            });

    } catch (error) {

    }
}

async function postBusiness(req, res) {
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(422).render("dashboard/business/manage", {
            pageTitle: "Add Busines",
            path: "/business/add",
            errors: errors.array(),
            errorMessage: false,
            customer: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const businessId = uuidv4();

        const customerData = {
            businessId: businessId,
            businessName: req.body.businessName,
            physicalLocation: req.body.physicalLocation,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        };

        const newCustomer = new Business(customerData);

        const savedCustomer = await newCustomer.save();

        if (savedCustomer) {
            return res.status(200).render("dashboard/business/manage", {
                pageTitle: "Add Business",
                path: "/business/add",
                errors: false,
                customer: false,
                errorMessage: false,
                successMessage: "Business added successfully",
                csrfToken: req.csrfToken(),
            });
        }

        return res.status(422).render("dashboard/business/manage", {
            pageTitle: "Add Business",
            path: "/business/add",
            errors: errors.array(),
            customer: false,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {

    }
}

async function listBusiness(req, res) {
    try {
        const customers = await Business.find();

        if (customers) {
            console.log(customers);
            return res.status(200).render("dashboard/business/list", {
                pageTitle: "List Businesses",
                path: "/businesses",
                errors: false,
                errorMessage: false,
                successMessage: false,
                customers: customers,
                csrfToken: req.csrfToken(),
                shortData: customData.shortData
            });
        }

        return res.status(422).render("dashboard/business/list", {
            pageTitle: "List Business",
            path: "/businesses",
            errors: false,
            errorMessage: false,
            successMessage: false,
            customers: customers,
            csrfToken: req.csrfToken(),
            shortData: customData.shortData
        });
    } catch (error) {
        res.render('dashboard/business/list', {
            pageTitle: 'List Business',
            path: '/business',
            errors: false,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: customData.shortData
        });
    }
}
async function deleteBusiness(req, res) {
    const businesses = await Business.find();
    try {
        // Find the customer by their businessId
        const business = await Business.findOne({ businessId: req.params.businessId });
        console.log(business)
        if (business) {
            // If the customer is found, delete the customer
            await Business.deleteOne({ businessId: req.params.businessId });
            return res.status(200).render("dashboard/business/list", {
                pageTitle: "List Businesses",
                path: "/business",
                errors: false,
                errorMessage: false,
                successMessage: 'Business deleted successfully',
                customers: businesses,
                csrfToken: req.csrfToken(),
            });
        } else {
            // Handle the case where the customer with the specified ID is not found
            console.log('Customer not found');
            return res.status(200).render("dashboard/business/list", {
                pageTitle: "List Businesses",
                path: "/businesses",
                errors: false,
                errorMessage: 'Business not found',
                successMessage: false,
                customers: businesses,
                csrfToken: req.csrfToken(),
            });
        }
    } catch (error) {
        // Handle any errors that occurred during the delete process
        console.error('Error deleting customer:', error.message);
        return res.status(200).render("dashboard/customer/list-customers", {
            pageTitle: "List Customers",
            path: "/customers",
            errors: false,
            errorMessage: 'Error deleting business' + error,
            successMessage: false,
            customers: businesses,
            csrfToken: req.csrfToken(),
        });
    }
}


module.exports = {
    getAddBusiness,
    getEditBusiness,
    postBusiness,
    listBusiness,
    putEditBusiness,
    deleteBusiness
};
