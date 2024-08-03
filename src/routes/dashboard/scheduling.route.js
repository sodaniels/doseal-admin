const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const schedulingController = require('../../controllers/dashboard/SchedulingController');


// // scheduling list
router.get("/schedule/list", isAuth, isSuperUser, schedulingController.getListScheduling);
// // get scheduled jobs
router.get("/schedule/add", isAuth, isSuperUser, schedulingController.getScheduling);
// get google map page
router.get("/schedule/map", isAuth, isSuperUser, schedulingController.getGoogleMap);
// post scheduled jobs
router.post("/schedule/add", isAuth, isSuperUser, schedulingController.postScheduling);
// get list jobs
router.get("/assign/job", isAuth, isSuperUser, schedulingController.getListJobs);
// post job assignment
router.post("/assign/job", isAuth, isSuperUser, validator.validateJob, schedulingController.postJobs);
// get job teams
router.get("/assign/job/teams", isAuth, isSuperUser, schedulingController.getListJobTeams);
// post job teams assignment
router.post("/assign/job/teams", isAuth, isSuperUser, schedulingController.postJobTeams);
// get job list
router.get("/jobs/list", isAuth, isSuperUser, schedulingController.getJobList);
// get sort qr codes
router.get("/sort/qr-code", isAuth, isSuperUser, schedulingController.getQrCodeSorting);
// post sort qr codes
router.post("/sort/qr-code", isAuth, isSuperUser, schedulingController.postQrCodeSorting);
// post sort qr-code preview
router.post("/sort/qr-code/preview", isAuth, isSuperUser, schedulingController.postQrCodePreview);

module.exports = router;
