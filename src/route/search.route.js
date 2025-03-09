const express = require("express");

const search_controller = require("../controllers/search.controller.js");

const route = express.Router();

route.post("/search", search_controller.searchByKeyword);
route.post("/search/:genre", search_controller.searchByGenre);

module.exports = route;