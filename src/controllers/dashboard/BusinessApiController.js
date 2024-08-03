const axios = require("axios");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const customData = require('../../helpers/shortData');
const Business = require('../../models/business');
const RestService = require('../../services/dashboard/RestServices');
const restService = new RestService();

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
        const client_reference = '12123';
        const response = await restService.postBusiness(req.body.businessName, req.body.physicalLocation, req.body.email, req.body.phoneNumber, client_reference);

        if (response.success) {
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
            errors: false,
            customer: false,
            errorMessage: response,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        return res.status(422).render("dashboard/business/manage", {
            pageTitle: "Add Business",
            path: "/business/add",
            errors: false,
            customer: false,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
        });
    }
}


module.exports = {
    postBusiness
};
