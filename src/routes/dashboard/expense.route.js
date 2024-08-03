const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const expenseController = require('../../controllers/dashboard/ExpenseController');



// list expenses
router.get("/expense/manage", isAuth, isSuperUser, expenseController.listExpense);
// get add expense
router.post("/expense/add", isAuth, isSuperUser, expenseController.postAddExpense);
// // get edit expense
router.get("/expense/edit/:_id", isAuth, isSuperUser, expenseController.getEditExpense);
// // post edit expense to db
router.post("/expense/edit/:_id", isAuth, isSuperUser, expenseController.putEditExpense);
// // get delete expense
router.get("/expense/delete/:_id", isAuth, isSuperUser, expenseController.getDeleteExpense);


module.exports = router;
