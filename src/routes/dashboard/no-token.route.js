const path = require("path");

const express = require("express");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const noTokenController = require('../../controllers/auth/NoTokenController');


router.post("/store-location", isAuth, isSuperUser, noTokenController.storeLocation);


module.exports = router;
