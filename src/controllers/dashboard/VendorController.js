const Vendor = require('../../models/vendor.model');
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require('../../helpers/shortData');
const { validationResult } = require("express-validator");

async function listVendor(req, res) {
    const errorMessage = req.query.errorMessage;
    const successMessage = req.query.successMessage;

    const vendors = await Vendor.find({}).sort({ _id: -1 });
    try {

        if (vendors) {
            return res.status(200).render("admin/vendors/manage", {
                pageTitle: "Manage Vendors",
                path: "/vendor/manage",
                errors: false,
                userInput: false,
                vendor: false,
                vendors: vendors,
                errorMessage: errorMessage ? errorMessage : false,
                successMessage: successMessage ? successMessage : false,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        }

        return res.status(422).render("admin/vendors/manage", {
            pageTitle: "Manage Vendors",
            path: "/vendor/manage",
            errors: false,
            vendor: false,
            vendors: vendors,
            userInput: false,
            errorMessage: false,
            successMessage: true,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    } catch (error) {
        return res.status(500).render("admin/vendors/manage", {
            pageTitle: "Manage Vendors",
            path: "/vendor/manage",
            errors: false,
            userInput: false,
            vendor: false,
            vendors: vendors,
            errorMessage: error,
            expenses: expenses,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function postAddVendor(req, res) {
    const vendors = await Vendor.find({}).sort({ _id: -1 });
    const errors = validationResult(req);
    const requestBody = req.body;
    const admin = req.session.user;

    if (!errors.isEmpty()) {
        return res.status(200).render("admin/vendors/manage", {
            pageTitle: "Manage Vendors",
            path: "/vendor/manage",
            errors: errors.array(),
            userInput: requestBody,
            vendor: false,
            vendors: vendors,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }

    try {

        const newVendor = new Vendor({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            address: req.body.address,
            service: req.body.service,
            note: req.body.note,
            createdBy: admin._id,
        });

        const savedVendor = await newVendor.save();

        if (savedVendor) {
            return res.redirect('/vendor/manage?successMessage=Expense saved successfully');
        } else {
            return res.redirect('/vendor/manage?errorMessage=Could not save vendor information');
        }
    } catch (error) {
        return res.status(500).render("admin/vendors/manage", {
            pageTitle: "Manage Vendors",
            path: "/vendor/manage",
            errors: false,
            userInput: requestBody,
            vendor: false,
            errorMessage: error,
            successMessage: false,
            vendors: vendors,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function getEditVendor(req, res) {

    try {
        const _id = req.params._id;
        const vendor = await Vendor.findOne({ _id: _id });
        const vendors = await Vendor.find({}).sort({ _id: -1 });

        if (vendor) {
            return res.status(200).render("admin/vendors/edit", {
                pageTitle: "Edit Vendor",
                path: "/vendor/edit/" + _id,
                errors: false,
                userInput: false,
                vendor: vendor,
                vendors: vendors,
                errorMessage: false,
                successMessage: false,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        } else {
            return res.status(200).render("admin/vendors/manage", {
                pageTitle: "Manage Vendor",
                path: "/vendors/manage",
                errors: false,
                vendor: vendor,
                vendors: vendors,
                userInput: false,
                errorMessage: false,
                successMessage: true,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        }



    } catch (error) {
        const vendors = await Vendor.find({}).sort({ _id: -1 });
        return res.status(200).render("admin/vendors/manage", {
            pageTitle: "Manage Vendor",
            path: "/vendors/manage",
            errors: false,
            userInput: false,
            vendor: false,
            vendors: vendors,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function putEditVendor(req, res) {
    const requestBody = req.body;
    const vendor = await Vendor.findOne({ _id: req.params._id });
    const vendors = await Vendor.find({}).sort({ _id: -1 });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).render("admin/vendors/edit", {
            pageTitle: "Edit Vendor",
            path: "/vendor/edit/" + _id,
            errors: false,
            userInput: requestBody,
            vendor: vendor,
            vendors: vendors,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }

    try {

        const updatedVendorData = {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            address: req.body.address,
            service: req.body.service,
            note: req.body.note,
        };

        Vendor.findOne({ _id: req.params._id })
            .then((vendor) => {
                if (vendor) {
                    // Update the vendor with the new data
                    Object.assign(vendor, updatedVendorData);
                    // Save the changes to the database
                    return vendor.save();
                } else {
                    // Handle the case where the expense with the specified ID is not found
                    return res.redirect('/vendor/manage?errorMessage=Vendor could not be found');
                }
            })
            .then(async (updatedVendor) => {
                // Handle the case where the update was successful
                return res.redirect('/vendor/manage?successMessage=Vendor updated successfully');
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                return res.status(422).render("admin/vendors/manage", {
                    pageTitle: "Manage Vendor",
                    path: "/vendor/manage/",
                    errors: false,
                    userInput: false,
                    vendor: vendor,
                    vendors: vendors,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                    shortData: shortData,
                    cuteDate: cuteDate,
                });
            });

    } catch (error) {
        return res.status(422).render("admin/vendors/manage", {
            pageTitle: "Manage Vendor",
            path: "/vendor/manage/",
            errors: false,
            userInput: false,
            vendor: vendor,
            vendors: vendors,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function getDeleteVendore(req, res) {
    try {
        const _id = req.params._id;
        const vendor = await Vendor.findOneAndDelete({ _id: _id });
        if (vendor) {
            return res.redirect('/vendor/manage?successMessage=Vendor deleted successfully');
        } else {
            return res.redirect('/vendor/manage?errorMessage=Could not delete Vendor');
        }
    } catch (error) {
        const vendors = await Vendor.find({}).sort({ _id: -1 });
        return res.status(422).render("admin/vendors/manage", {
            pageTitle: "Edit Vendor",
            path: "/vendor/manaage/",
            errors: false,
            userInput: false,
            vendor: false,
            vendors: vendors,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }




}

module.exports = {
    listVendor,
    postAddVendor,
    getEditVendor,
    putEditVendor,
    getDeleteVendore
};
