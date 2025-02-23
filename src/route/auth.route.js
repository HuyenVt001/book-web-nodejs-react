const express = require("express");

const auth_controller = require("../controllers/auth.controller.js");
const checkLogin = require("../middleware/check-login.js");

const route = express.Router();

route.post("/signup", auth_controller.signup);
route.get("/verify-email", auth_controller.verifyEmail);
route.post("/signin", auth_controller.signin);

route.post("/reset-password", auth_controller.resetPassword);

route.post("/update/username", checkLogin, auth_controller.updateUsername);
route.post("/update/avatar", checkLogin, auth_controller.updateAvatar);
route.post("/update/password", checkLogin, auth_controller.updatePassword);

module.exports = route;

