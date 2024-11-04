const path = require("path");
const express = require("express");
const multer = require("multer");
const router = express.Router();

const validator = require("../../helpers/validator");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Set the destination folder where uploaded files will be stored
		// cb(null, "uploads/news");
		const destinationPath = path.join(__dirname, "../../public/uploads/receipts");
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
			"application/pdf", // PDF files
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
		];

		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Invalid file type. Only JPG, JPEG, WEBP, PNG, PDF, and DOCX files are allowed."
				)
			);
		}
	},
});

const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");

const expenseController = require("../../controllers/dashboard/ExpenseController");

// list expenses
router.get(
	"/expense/manage",
	isAuth,
	isSuperUser,
	expenseController.listExpense
);
// get add expense
router.get(
	"/expense/add",
	isAuth,
	isSuperUser,
	expenseController.getAddExpense
);
// get add expense
router.post(
	"/expense/add",
	isAuth,
	isSuperUser,
	upload.fields([{ name: "receipt" }]),
	expenseController.postAddExpense
);
// // get edit expense
router.get(
	"/expense/edit/:_id",
	isAuth,
	isSuperUser,
	expenseController.getEditExpense
);
// // post edit expense to db
router.post(
	"/expense/edit/:_id",
	isAuth,
	isSuperUser,
	expenseController.putEditExpense
);
// // get delete expense
router.get(
	"/expense/delete/:_id",
	isAuth,
	isSuperUser,
	expenseController.getDeleteExpense
);

module.exports = router;