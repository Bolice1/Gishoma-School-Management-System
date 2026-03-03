const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { authenticate, requireSchoolContext } = require("../middleware/auth");
const { canPostAnnouncement } = require("../middleware/announcements");
const { handleValidation } = require("../middleware/validate");
const { createAnnouncementRules } = require("../validators/entityValidators");

router.use(authenticate, requireSchoolContext);

router.get("/", announcementController.list);
router.post("/", canPostAnnouncement, createAnnouncementRules, handleValidation, announcementController.create);

module.exports = router;
