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

// các route comment trong request query cần chứa commentId trừ post-comment và get-comment
route.post("/post-comment", checkLogin, auth_controller.postComment);
// request body cần chứa content, request query cần chứa storyId
route.post("/update-comment", checkLogin, auth_controller.updateComment);
route.post("/delete-comment", checkLogin, auth_controller.deleteComment);
route.get("/get-comment", checkLogin, auth_controller.getComment);

module.exports = route;

