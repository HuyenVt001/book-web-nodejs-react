const express = require("express");

const search_controller = require("../controllers/search.controller.js");

const route = express.Router();

route.post("/keyword/:order/:page", search_controller.searchByKeyword);
//order: views và dates
route.post("/authorName/:order/:page", search_controller.searchByAuthorName);
route.post("/genre/:genreId/:order/:page", search_controller.searchByGenre);

module.exports = route;