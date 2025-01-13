const path = require("path");

const express = require("express");

const router = express.Router();

const transactionController = require('../../controllers/dashboard/TransactionController');
const viewTransactions = require("../../Middleware/view-transactions");

/**Transactions */
// get transactions
router.use(viewTransactions)
router.get("/transactions", transactionController.getTransactions);
/**Transactions */

module.exports = router;
