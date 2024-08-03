const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const personsController = require('../../controllers/dashboard/PersonController');



// list drivers
router.get("/persons", isAuth, isSuperUser, personsController.listPerson);
// get add driver
router.get("/person/add", isAuth, isSuperUser, personsController.getAddPerson);
// post add driver
router.post("/person/add", isAuth, validator.validateDriver, personsController.postAddPerson);
// get edit driver
router.get("/person/edit/:userId", isAuth, isSuperUser, personsController.getEditPerson);
// post edit driver to db
router.post("/person/edit/:userId", isAuth, isSuperUser, personsController.putEditPerson);
// get delete driver
router.get("/person/delete/:userId", isAuth, isSuperUser, personsController.postDeletePerson);


module.exports = router;
