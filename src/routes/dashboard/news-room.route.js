const path = require("path");
const express = require("express");
const multer = require("multer");



const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Set the destination folder where uploaded files will be stored
		// cb(null, "uploads/news");
		const destinationPath = path.join(__dirname, "../../public/uploads/news");
		cb(null, destinationPath);
	},
	filename: function (req, file, cb) {
		// Keep the file extension and generate a unique filename
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Generate a unique suffix
		const fileExtension = file.originalname.split(".").pop(); // Get the file extension
		const filename = uniqueSuffix + "." + fileExtension; // Combine the suffix and extension
		cb(null, filename);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		const allowedTypes = [
			"image/jpg",
			"image/jpeg",
			"image/png",
			"image/webp",
		];

		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Invalid file type. Only JPG, JPEG, WEBP and PNG files are allowed."
				)
			);
		}
	},
});

const router = express.Router();



const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");
const validator = require("../../helpers/validator-processor");
const newsRoomController = require("../../controllers/dashboard/NewsRoomController");

// list news room
router.get(
	"/news-room/manage",
	isAuth,
	isSuperUser,
	newsRoomController.listItem
);
// get add news room
router.get(
	"/news-room/add",
	isAuth,
	isSuperUser,
	newsRoomController.getAddItem
);
router.post(
	"/news-room/add",
	isAuth,
	isSuperUser,
	upload.fields([{ name: "image" }]),
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
	upload.fields([{ name: "image" }]),
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
