const express = require("express");

const story_controller = require("../controllers/story.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-story", check_role.isManager, story_controller.postStory);
route.post("/update/info", check_role.isManager, story_controller.updateStory);
route.post("/update/image", check_role.isManager, story_controller.updateImage);
route.post("/delete", check_role.isManager, story_controller.deleteStory);

route.get("/info", story_controller.getInfo);

module.exports = route;
