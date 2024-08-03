const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const onboardingController = require('../../controllers/dashboard/OnboardingController');

const validator = require('../../helpers/validator');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where uploaded files will be stored
        cb(null, 'uploads/identification');
    },
    filename: function (req, file, cb) {
        // Keep the file extension and generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique suffix
        const fileExtension = file.originalname.split('.').pop(); // Get the file extension
        const filename = uniqueSuffix + '.' + fileExtension; // Combine the suffix and extension
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage, fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Only JPG, JPEG, PNG, and GIF images are allowed."
                )
            );
        }
    },
});

/**user onboarding */
// onboarding lists
router.get("/onboarded/users", isAuth, isSuperUser, onboardingController.listOnboarding);
// get onboarding user
router.get("/onboarding/user/add", isAuth, isSuperUser, onboardingController.getOnboarding);
//post onboarding user
router.post("/onboarding/user/add", isAuth, isSuperUser, validator.validateOnboarding, upload.fields([{ name: 'idPhoto' }]), onboardingController.postOnboarding);
// get edit onboarding
router.get("/onboarding/user/edit/:userId", isAuth, isSuperUser, validator.validateOnboarding, onboardingController.getEditOnboarding);
// post edit onboarding
router.post("/onboarding/user/edit/:userId", isAuth, isSuperUser, validator.validateOnboarding, onboardingController.putEditOnboarding);
// get single onboarded user
router.get("/onboarding/user/:userId", isAuth, isSuperUser, onboardingController.getOnboardedUser);
/**user onboarding */

/**business onboarding */
router.post("/onboarding/business/add", isAuth, isSuperUser, validator.validateBusinessOnboarding, upload.fields([{ name: 'idPhoto' }]), onboardingController.postBusinessOnboarding);

/**Dustbin */
// get add user dustbin
router.get("/user/dustbin/add/:userId", isAuth, onboardingController.getAddDustbin);
// post user dustbin
router.post("/user/dustbin/add/:userId", isAuth, validator.validateDustbin, onboardingController.postAddDustbin);
// get edit dustbin
router.get("/user/dustbin/edit/:dustbinId", isAuth, onboardingController.getEditDustbin);
// post edit dustbin
router.post("/user/dustbin/edit/:dustbinId", isAuth, onboardingController.putEditDustbin);

module.exports = router;
