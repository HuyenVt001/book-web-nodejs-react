const express = require("express");

const story_controller = require("../controllers/story.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-story", story_controller.postStory);
route.post("/update/info/:storyId", check_role.isManager, story_controller.updateStory);
route.post("/update/image/:storyId", check_role.isManager, story_controller.updateImage);
route.post("/update/genre/:storyId", check_role.isManager, story_controller.updateGenre);
route.post("/delete/:storyId", check_role.isAuthor, story_controller.deleteStory);

route.post("/add-manager/:storyId", check_role.isAuthor, story_controller.addManager);
route.post("/delete-manager/:storyId", check_role.isAuthor, story_controller.deleteManager);

route.get("/info/:storyId", story_controller.getInfo);
route.get("/chapter/:storyId", story_controller.getChapter);
route.get("/comment/:storyId", story_controller.getComment);

module.exports = route;
