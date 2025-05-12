const express = require("express");
const router = express.Router();
const admin_controller = require("../controllers/admin.controller.js");
const story_controller = require("../controllers/story.controller.js")
const chapter_controller = require("../controllers/chapter.controller.js");
const auth_controller = require("../controllers/auth.controller.js");
const check_role = require("../middleware/check-role.js");

router.get("/users", check_role.isAdmin, admin_controller.getAllUsers);
router.get("/users/:userId", check_role.isAdmin, admin_controller.getUserById);
router.get("/users/:userId/role", check_role.isAdmin, admin_controller.addAdminRole);
router.get("/users/:userId/delete-role", check_role.isAdmin, admin_controller.deleteAdminRole);
router.delete("/users/:userId", check_role.isAdmin, admin_controller.deleteUser);

router.get("/stories", check_role.isAdmin, story_controller.getAllStory);
router.get("/stories/:storyId", check_role.isAdmin, story_controller.getStoryById);

router.get("/stories/pending", check_role.isAdmin, admin_controller.getPendingStories);
router.post("/stories/approve/:storyId", check_role.isAdmin, admin_controller.approveStory);
router.post("/stories/drop/:storyId", check_role.isAdmin, admin_controller.dropStory);

router.get("/chapters", check_role.isAdmin, chapter_controller.getAllChapters);
router.get("/chapters/:chapterId", check_role.isAdmin, chapter_controller.getChapterById);

router.get("/chapters/pending", check_role.isAdmin, admin_controller.getPendingChapters);
router.put("/chapters/:chapterId/approve", check_role.isAdmin, admin_controller.approveChapter);
router.put("/chapters/:chapterId/drop", check_role.isAdmin, admin_controller.dropChapter);

router.get("/comments", check_role.isAdmin, auth_controller.getAllComments);
router.get("/comments/:commentId", check_role.isAdmin, auth_controller.getCommentByUsernameOrEmail);
router.delete("/comments/:commentId", check_role.isAdmin, auth_controller.deleteComment);

module.exports = router; 