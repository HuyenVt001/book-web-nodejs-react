const express = require("express");

const search_controller = require("../controllers/search.controller.js");

const route = express.Router();

route.post("/:order/:page", search_controller.searchByKeyword);
route.post("/:genreName/:order/:page", search_controller.searchByGenre);

module.exports = route;