const express = require("express");

const chapter_controller = require("../controllers/chapter.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-chapter/:storyId", check_role.isManager, chapter_controller.postChapter);
// request body: title và content
route.post("/update-chapter/:storyId/:chapterId", check_role.isManager, chapter_controller.updateChapter);
// request body: title (có thể có hoặc không), content (có thể có hoặc không)
route.post("/delete-chapter/:storyId/:chapterId", check_role.isManager, chapter_controller.deleteChapter);

route.get("/get-chapter/:chapterId", chapter_controller.getChapter);

module.exports = route;