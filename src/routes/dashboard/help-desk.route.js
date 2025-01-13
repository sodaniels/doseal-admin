const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator-processor");

const viewHelpDesk = require("../../Middleware/view-help-desk");

const helpDeskController = require("../../controllers/dashboard/HelpDeskController");

router.use(viewHelpDesk)
// list expenses
router.get("/help-desk/manage", helpDeskController.listItem);
router.get("/help-desk/add", helpDeskController.AddItem);
// get add expense
router.post(
	"/help-desk/add",
	validator.validateHelpDesk,
	helpDeskController.postAddHelpDesk
);
// // get edit expense
router.get(
	"/help-desk/edit/:_id",
	helpDeskController.getEditHelpDesk
);
// // post edit expense to db
router.post(
	"/help-desk/edit/:_id",
	helpDeskController.putEditHelpDesk
);
// // get delete expense
router.get(
	"/help-desk/delete/:_id",
	helpDeskController.getDeleteHelpDesk
);

module.exports = router;
