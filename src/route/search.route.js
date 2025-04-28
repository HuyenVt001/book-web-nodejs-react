const express = require("express");

const search_controller = require("../controllers/search.controller.js");

const route = express.Router();

route.post("/keyword/:order/:page", search_controller.searchByKeyword);
route.post("/genre/:genreId/:order/:page", search_controller.searchByGenre);

module.exports = route;