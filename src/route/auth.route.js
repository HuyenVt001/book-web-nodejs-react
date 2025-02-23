const express = require("express");

const auth_controller = require("../controllers/auth.controller.js");

const route = express.Router();

route.post("/signup", auth_controller.signup);
route.get("/verify-email", auth_controller.verifyEmail);
route.post("/signin", auth_controller.signin);

module.exports = route;

