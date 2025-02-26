const express = require("express");

const story_controller = require("../controllers/story.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-story", story_controller.postStory);
// các route dưới request query cần chứa id của story
route.post("/update/info", check_role.isManager, story_controller.updateStory);
route.post("/update/image", check_role.isManager, story_controller.updateImage);
route.post("/update/genre", check_role.isManager, story_controller.updateGenre);
route.post("/delete", check_role.isAuthor, story_controller.deleteStory);

route.post("/add-manager", check_role.isAuthor, story_controller.addManager);
route.post("/delete-manager", check_role.isAuthor, story_controller.deleteManager);

route.get("/info", story_controller.getInfo);
route.get("/chapter", story_controller.getChapter);
route.get("/comment", story_controller.getComment);

module.exports = route;
