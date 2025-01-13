const path = require("path");

const express = require("express");

const router = express.Router();
const validator = require("../../helpers/validator");

const viewUsers = require("../../Middleware/view-users");

const usersController = require("../../controllers/dashboard/UserController");

router.use(viewUsers);
// list users
router.get("/users1", usersController.listUsers1);
// get edit user page
router.get("/user/edit/:userId", usersController.getEditUser);
// // post edit user to db
router.post("/user/edit/:userId", usersController.putEditUser);

// list users
router.get("/users", usersController.listUsers);
// get user page
router.get("/users/add", usersController.getAddUser);
// post add user
router.post("/users/add", validator.validateUser, usersController.postAddUser);
// get edit user page
router.get("/users/edit/:userId", usersController.getEditUser);
// post edit user to db
router.post("/users/edit/:userId", usersController.putEditUser);

module.exports = router;
