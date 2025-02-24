const express = require("express");

const story_controller = require("../controllers/story.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/post-story", story_controller.postStory);
route.post("/update/info", check_role.isManager, story_controller.updateStory);
//http://localhost:8888/api/story/update/info?id=<giá trị id được truyền vào trên query>
route.post("/update/image", check_role.isManager, story_controller.updateImage);
//http://localhost:8888/api/story/update/update?id=<giá trị id được truyền vào trên query>
route.post("/delete", check_role.isAuthor, story_controller.deleteStory);
//http://localhost:8888/api/story/delete?id=<giá trị id được truyền vào trên query>

route.post("/add-manager", check_role.isAuthor, story_controller.addManager);
//http://localhost:8888/api/story/add-manager?id=<giá trị id được truyền vào trên query>
route.post("/delete-manager", check_role.isAuthor, story_controller.deleteManager);
//http://localhost:8888/api/story/delete-manage?id=<giá trị id được truyền vào trên query>

route.get("/info", story_controller.getInfo);
//http://localhost:8888/api/story/info?id=<giá trị id được truyền vào trên query>

module.exports = route;
