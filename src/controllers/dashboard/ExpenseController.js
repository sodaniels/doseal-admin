const Expense = require('../../models/expense.model');
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require('../../helpers/shortData');
const { rand10Id, randId } = require('../../helpers/randId');
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');

async function listExpense(req, res) {
    const errorMessage = req.query.errorMessage;
    const successMessage = req.query.successMessage;

    const expenses = await Expense.find({}).sort({ _id: -1 });
    try {

        if (expenses) {
            return res.status(200).render("admin/expenses/manage", {
                pageTitle: "Manage Expenses",
                path: "/expenses/manage",
                errors: false,
                userInput: false,
                expense: false,
                errorMessage: errorMessage ? errorMessage : false,
                successMessage: successMessage ? successMessage : false,
                expenses: expenses,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        }

        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: false,
            expense: false,
            userInput: false,
            errorMessage: false,
            successMessage: true,
            expenses: expenses,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    } catch (error) {
        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: false,
            userInput: false,
            expense: false,
            errorMessage: error,
            expenses: expenses,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function postAddExpense(req, res) {
    const expenses = await Expense.find({}).sort({ _id: -1 });
    const errors = validationResult(req);
    const requestBody = req.body;
    const admin = req.session.user;

    if (!errors.isEmpty()) {
        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: errors.array(),
            userInput: requestBody,
            expense: false,
            errorMessage: false,
            successMessage: false,
            expenses: expenses,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }

    try {

        const newExpense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            date: req.body.date,
            note: req.body.note,
            createdBy: admin._id,
        });

        const savedExpense = await newExpense.save();

        if (savedExpense) {
            const expenses = await Expense.find({}).sort({ _id: -1 });
            return res.status(200).render("admin/expenses/manage", {
                pageTitle: "Manage Expenses",
                path: "/expenses/manage",
                errors: false,
                userInput: requestBody,
                expense: false,
                errorMessage: false,
                successMessage: "Expense saved successfully",
                expenses: expenses,
                csrfToken: req.csrfToken(),
                shortData: shortData
            });
        }

        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: false,
            userInput: requestBody,
            expense: false,
            errorMessage: false,
            successMessage: false,
            expenses: expenses,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    } catch (error) {
        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: false,
            userInput: requestBody,
            expense: false,
            errorMessage: error,
            successMessage: false,
            expenses: expenses,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}
async function getEditExpense(req, res) {

    try {
        const _id = req.params._id;
        const expense = await Expense.findOne({ _id: _id });
        const expenses = await Expense.find({}).sort({ _id: -1 });

        if (expense) {
            return res.status(200).render("admin/expenses/edit", {
                pageTitle: "Edit Expense",
                path: "/expense/edit/" + _id,
                errors: false,
                userInput: false,
                expense: expense,
                expenses: expenses,
                errorMessage: false,
                successMessage: false,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        } else {
            return res.status(200).render("admin/expenses/manage", {
                pageTitle: "Manage Expenses",
                path: "/expenses/manage",
                errors: false,
                expense: false,
                userInput: false,
                errorMessage: false,
                successMessage: true,
                expenses: false,
                csrfToken: req.csrfToken(),
                shortData: shortData,
                cuteDate: cuteDate,
            });
        }



    } catch (error) {
        return res.status(200).render("admin/expenses/manage", {
            pageTitle: "Manage Expenses",
            path: "/expenses/manage",
            errors: false,
            userInput: false,
            expense: false,
            errorMessage: error,
            expenses: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function putEditExpense(req, res) {
    const requestBody = req.body;
    const expenses = await Expense.find({}).sort({ _id: -1 });
    const expense = await Expense.findOne({ _id: req.params._id });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).render("admin/expenses/edit", {
            pageTitle: "Edit Expense",
            path: "/expense/edit/" + _id,
            errors: false,
            userInput: requestBody,
            expense: expense,
            expenses: expenses,
            errorMessage: false,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }

    try {

        const updatedExpenseData = {
            title: req.body.title,
            amount: req.body.amount,
            date: req.body.date,
            note: req.body.note,
        };

        Expense.findOne({ _id: req.params._id })
            .then((expense) => {
                if (expense) {
                    // Update the expense with the new data
                    Object.assign(expense, updatedExpenseData);
                    // Save the changes to the database
                    return expense.save();
                } else {
                    // Handle the case where the expense with the specified ID is not found
                    return res.redirect('/expense/manage?errorMessage=Expense could not be found');
                }
            })
            .then(async (updatedExpense) => {
                // Handle the case where the update was successful
                return res.redirect('/expense/manage?successMessage=Expense updated successfully');
            })
            .catch((error) => {
                // Handle any errors that occurred during the update process
                return res.status(422).render("admin/expenses/manage", {
                    pageTitle: "Manage Expense",
                    path: "/expense/maange/",
                    errors: false,
                    userInput: false,
                    expense: expense,
                    expenses: expenses,
                    errorMessage: error,
                    successMessage: false,
                    csrfToken: req.csrfToken(),
                    shortData: shortData,
                    cuteDate: cuteDate,
                });
            });

    } catch (error) {
        return res.status(422).render("admin/expenses/manage", {
            pageTitle: "Manage Expense",
            path: "/expense/maange/",
            errors: false,
            userInput: false,
            expense: expense,
            expenses: expenses,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }
}

async function getDeleteExpense(req, res) {
    try {
        const _id = req.params._id;
        const expense = await Expense.findOneAndDelete({ _id: _id });
        if (expense) {
            return res.redirect('/expense/manage?successMessage=Expense deleted successfully');
        } else {
            return res.redirect('/expense/manage?errorMessage=Could not delete Expense');
        }
    } catch (error) {
        const expenses = await Expense.find({}).sort({ _id: -1 });
        return res.status(422).render("admin/expenses/manage", {
            pageTitle: "Edit Expense",
            path: "/expense/manaage/",
            errors: false,
            userInput: false,
            expense: false,
            expenses: expenses,
            errorMessage: error,
            successMessage: false,
            csrfToken: req.csrfToken(),
            shortData: shortData,
            cuteDate: cuteDate,
        });
    }




}


module.exports = {
    listExpense,
    postAddExpense,
    getEditExpense,
    putEditExpense,
    getDeleteExpense
};
