const express = require("express");

const story_controller = require("../controllers/story.controller.js");
const check_role = require("../middleware/check-role.js");
const checkLogin = require("../middleware/check-login.js");

const route = express.Router();

route.post("/post-story", checkLogin, story_controller.postStory);
route.post("/update/:storyId", check_role.isManager, story_controller.updateStory);
route.post("/delete/:storyId", check_role.isAuthor, story_controller.deleteStory);

route.get("/managed-stories", checkLogin, story_controller.getManagedStories);
route.post("/add-manager/:storyId", check_role.isAuthor, story_controller.addManager);
route.post("/delete-manager/:storyId", check_role.isAuthor, story_controller.deleteManager);

route.get("/:storyId/:page", story_controller.getStory);

module.exports = route;
