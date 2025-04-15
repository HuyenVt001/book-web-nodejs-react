const express = require("express");
const router = express.Router();
const admin_controller = require("../controllers/admin.controller.js");
const check_role = require("../middleware/check-role.js");

router.get("/users", check_role.isAdmin, admin_controller.getAllUsers);
router.get("/users/:userId", check_role.isAdmin, admin_controller.getUserById);
router.put("/users/:userId", check_role.isAdmin, admin_controller.updateUser);
router.delete("/users/:userId", check_role.isAdmin, admin_controller.deleteUser);

router.get("/stories", check_role.isAdmin, admin_controller.getAllStories);
router.get("/stories/:storyId", check_role.isAdmin, admin_controller.getStoryById);
router.put("/stories/:storyId", check_role.isAdmin, admin_controller.updateStory);
router.delete("/stories/:storyId", check_role.isAdmin, admin_controller.deleteStory);

router.get("/stories/pending", check_role.isAdmin, admin_controller.getPendingStories);
router.put("/stories/:storyId/approve", check_role.isAdmin, admin_controller.approveStory);

router.get("/chapters", check_role.isAdmin, admin_controller.getAllChapters);
router.get("/chapters/:chapterId", check_role.isAdmin, admin_controller.getChapterById);
router.put("/chapters/:chapterId", check_role.isAdmin, admin_controller.updateChapter);
router.delete("/chapters/:chapterId", check_role.isAdmin, admin_controller.deleteChapter);

router.get("/chapters/pending", check_role.isAdmin, admin_controller.getPendingChapters);
router.put("/chapters/:chapterId/approve", check_role.isAdmin, admin_controller.approveChapter);

router.get("/comments", check_role.isAdmin, admin_controller.getAllComments);
router.get("/comments/:commentId", check_role.isAdmin, admin_controller.getCommentById);
router.put("/comments/:commentId", check_role.isAdmin, admin_controller.updateComment);
router.delete("/comments/:commentId", check_role.isAdmin, admin_controller.deleteComment);

module.exports = router; 