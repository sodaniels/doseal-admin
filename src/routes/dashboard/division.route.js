const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const divisionController = require('../../controllers/dashboard/DivisionController');

const validator = require('../../helpers/validator');

/**districts */
// get districts
router.get("/districts", isAuth, isSuperUser, divisionController.listDistricts);
// post user district/
router.post("/district/add", isAuth, validator.validateDistrict, divisionController.postAddDistrict);
//add district
router.get("/add-district", isAuth, isSuperUser, divisionController.getAddDistrict);
// get edit district
router.get("/district/edit/:id", isAuth, isSuperUser, divisionController.getEditDistrict);
// post edit district
router.post("/district/edit/:id", isAuth, isSuperUser, validator.validatePostDistrict, divisionController.putEditDistrict);
//get delete region
router.get("/district/delete/:id", isAuth, isSuperUser, divisionController.getDeleteDistrict);
/**end of districts */ 
/**assemblies */
router.get("/assemblies", isAuth, isSuperUser, divisionController.listAssemblies);
//get add assembly
router.get("/add-assembly", isAuth, isSuperUser, divisionController.getAddAssembly);
//post add assembly
router.post("/assembly/add", isAuth, validator.validateAssembly, divisionController.postAddAssembly);
//get edit assembly
router.get("/assembly/edit/:id", isAuth, isSuperUser, divisionController.getEditAssembly);
// post edit assembly
router.post("/assembly/edit/:id", isAuth, isSuperUser, validator.validatePostAssembly, divisionController.putEditAssembly);
// get delete assembly
router.get("/assembly/delete/:id", isAuth, isSuperUser, divisionController.getDeleteAssembly);

router.get("/regions", isAuth, isSuperUser, divisionController.getDeleteAssembly);
// get districts
router.get("/select-districts", isAuth, isSuperUser, divisionController.selectDistricts);
// get assemblies
router.get("/select-assemblies", isAuth, isSuperUser, divisionController.selectAssemblies);


module.exports = router;
