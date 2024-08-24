const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator");

const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");

const newsRoomController = require("../../controllers/dashboard/NewsRoomController");

// list news room
router.get(
	"/news-room/manage",
	isAuth,
	isSuperUser,
	newsRoomController.listItem
);
// get add news room
router.post(
	"/news-room/add",
	isAuth,
	isSuperUser,
	newsRoomController.postAddItem
);
// // get edit news room
router.get(
	"/news-room/edit/:_id",
	isAuth,
	isSuperUser,
	newsRoomController.getEditItem
);
// // post edit news room to db
router.post(
	"/news-room/edit/:_id",
	isAuth,
	isSuperUser,
	newsRoomController.putEditItem
);
// // get delete news room
router.get(
	"/news-room/delete/:_id",
	isAuth,
	isSuperUser,
	newsRoomController.getDeleteItem
);

module.exports = router;
