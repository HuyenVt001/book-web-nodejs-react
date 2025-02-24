const express = require("express");

const auth_controller = require("../controllers/auth.controller.js");
const checkLogin = require("../middleware/check-login.js");

const route = express.Router();

route.post("/signup", auth_controller.signup);
// cần username, password, email
route.get("/verify-email", auth_controller.verifyEmail);
route.post("/signin", auth_controller.signin);
// cần usernameOrEmail và password

route.post("/reset-password", auth_controller.resetPassword);
// request body cần có thuộc tính usernameOrEmail

route.post("/update/username", checkLogin, auth_controller.updateUsername);
// request body cần có newUsername
route.post("/update/avatar", checkLogin, auth_controller.updateAvatar);
// request body cần có avatar
route.post("/update/password", checkLogin, auth_controller.updatePassword);
// request body cần có password và newPassword

module.exports = route;

