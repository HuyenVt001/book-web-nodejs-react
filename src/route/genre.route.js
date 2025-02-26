const express = require("express");

const genre_controller = require("../controllers/genre.controller.js");
const check_role = require("../middleware/check-role.js");

const route = express.Router();

route.post("/add-genre", check_role.isAdmin, genre_controller.addGenre);
route.post("/delete-genre", check_role.isAdmin, genre_controller.deleteGenre);
//request body cần có thuộc tính name của thể loại muốn xóa

route.get("/all-genre", genre_controller.getAll);

module.exports = route;