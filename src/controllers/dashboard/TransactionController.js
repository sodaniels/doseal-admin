const axios = require("axios");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');


const Customer = require('../../models/business');

async function getTransactions(req, res) {
    res.render('dashboard/transactions/transactions', {
        pageTitle: 'Transactions',
        path: '/transactions',
        errors: false,
        customer: false,
        customers:  [],
        errorMessage: false,
        successMessage: false,
        csrfToken: req.csrfToken(),
    });
}



module.exports = {
    getTransactions,
};
