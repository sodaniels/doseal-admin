const Transaction = require('../../models/transaction.model');

async function getTransactions(req, res) {
    res.render('backend/transactions/manage', {
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
