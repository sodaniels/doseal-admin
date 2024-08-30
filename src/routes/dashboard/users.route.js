const path = require("path");

const express = require("express");

const router = express.Router();
const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const usersController = require('../../controllers/dashboard/UserController');

// list users
router.get("/users1", isAuth, isSuperUser, usersController.listUsers1);
// get edit user page
router.get("/user/edit/:userId", isAuth, isSuperUser, usersController.getEditUser);
// // post edit user to db
router.post("/user/edit/:userId", isAuth, isSuperUser, usersController.putEditUser);


// list users
router.get("/users", isAuth, isSuperUser, usersController.listUsers);
// get user page
router.get("/users/add", isAuth, isSuperUser, usersController.getAddUser);
// post add user
router.post("/users/add", isAuth, isSuperUser, validator.validateUser, usersController.postAddUser);
// get edit user page
router.get("/users/edit/:userId", isAuth, isSuperUser, usersController.getEditUser);
// post edit user to db
router.post("/users/edit/:userId", isAuth, isSuperUser, usersController.putEditUser);




module.exports = router;
