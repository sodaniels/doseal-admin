const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const teamController = require('../../controllers/dashboard/TeamController');


// scheduling list
router.get("/team/list", isAuth, isSuperUser, teamController.getListTeam);
// get scheduled jobs
router.get("/team/add", isAuth, isSuperUser, teamController.getTeam);
// post scheduled jobs
router.post("/team/add", isAuth, isSuperUser, validator.validateTeam, teamController.postTeam);
// get edit scheduled jobs
router.get("/team/edit/:_id", isAuth, isSuperUser, teamController.getEditTeam);
// post edit scheduled jobs
router.post("/team/edit/:_id", isAuth, isSuperUser, validator.validateTeam, teamController.putEditTeam);
// get view single team
router.get("/team/view/:_id", isAuth, isSuperUser, teamController.getViewTeam);


module.exports = router;
