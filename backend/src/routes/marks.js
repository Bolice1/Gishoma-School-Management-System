const express = require("express");
const router = express.Router();
const markController = require("../controllers/markController");
const { authenticate, authorize, requireSchoolContext } = require("../middleware/auth");
const { assertSchoolAccess } = require("../middleware/schoolAccess");
const { handleValidation } = require("../middleware/validate");
const { createMarkRules, bulkCreateMarkRules, removeMarkRules } = require("../validators/entityValidators");

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get("/", authorize("super_admin", "school_admin", "dean", "teacher", "patron", "matron", "student"), markController.list);
router.post("/", authorize("teacher", "patron", "matron", "dean", "school_admin"), createMarkRules, handleValidation, markController.create);
router.post("/bulk", authorize("teacher", "patron", "matron", "dean", "school_admin"), bulkCreateMarkRules, handleValidation, markController.bulkCreate);
router.delete("/:id", authorize("teacher", "patron", "matron", "dean", "school_admin"), removeMarkRules, handleValidation, markController.remove);

module.exports = router;
