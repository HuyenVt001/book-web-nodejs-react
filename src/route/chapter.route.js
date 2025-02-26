const express = require("express");

const chapter_controller = require("../controllers/chapter.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-chapter", check_role.isManager, chapter_controller.postChapter);
// request body: title và content, request query: id của story 
route.post("/update-chapter", check_role.isManager, chapter_controller.updateChapter);
// request body: title (có thể có hoặc không), content (có thể có hoặc không), request query: id của story, chapterId
route.post("/delete-chapter", check_role.isManager, chapter_controller.deleteChapter);

route.get("/get-chapter", chapter_controller.getChapter);

module.exports = route;