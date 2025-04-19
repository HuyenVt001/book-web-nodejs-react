const express = require("express");

const auth_controller = require("../controllers/auth.controller.js");
const checkLogin = require("../middleware/check-login.js");

const route = express.Router();

route.post("/signup", auth_controller.signup);
// cần username, password, email
route.get("/verify-email", auth_controller.verifyEmail);
route.post("/signin", auth_controller.signin);
// cần usernameOrEmail và password
route.post("/logout", auth_controller.logout);

route.post("/reset-password", auth_controller.resetPassword);
// request body cần có thuộc tính usernameOrEmail

route.post("/update/username", checkLogin, auth_controller.updateUsername);
// request body cần có newUsername
route.post("/update/avatar", checkLogin, auth_controller.updateAvatar);
// request body cần có avatar
route.post("/update/password", checkLogin, auth_controller.updatePassword);
// request body cần có password và newPassword

route.post("/post-comment/:storyId", checkLogin, auth_controller.postComment);
// request body cần có content
route.post("/update-comment/:commentId", checkLogin, auth_controller.updateComment);
// request body cần có content
route.post("/delete-comment/:commentId", checkLogin, auth_controller.deleteComment);
route.get("/get-comment", checkLogin, auth_controller.getCommentByUsernameOrEmail);

route.post("/add-favorite/:storyId", checkLogin, auth_controller.addFavorite);
route.get("/get-favorite", checkLogin, auth_controller.getFavorite);
route.post("/delete-favorite/:storyId", checkLogin, auth_controller.deleteFavorite);

route.get("/get-notification", checkLogin, auth_controller.getNotification);
route.get("/read-notification/:notificationId", checkLogin, auth_controller.readNotification);

module.exports = route;

