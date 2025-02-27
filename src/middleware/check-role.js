const jwt = require("jsonwebtoken");
const db = require("../models/index.js");
const { where } = require("sequelize");
require("dotenv").config();

/**
 * 
 * 0 - admin
 * 1 - author
 * 2 - manager
 * 3 - reader 
 */

let isAuthor = async (req, res, next) => {
    try {
        //kiểm tra đăng nhập
        let authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decode, "--------");
        if (!decode)
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });

        //kiểm tra quyền hạn
        let role = decode.roleId;
        if (role > 1)
            return res.status(400).json("Bạn không có quyền truy cập");

        //check quyền chỉnh sửa
        let check = checkManagedStories(decode.id, req.query.id);
        if (check == null)
            return res.status(400).json({ message: "Không tìm thấy sách hoặc không có quyền chỉnh sửa sách" });

        //gửi thông tin
        req.user = check.user;
        req.managedStories = check.managedStories;
        next();
    } catch (error) {
        console.log(error);
    }
};

let isAdmin = async (req, res, next) => {
    try {
        //kiểm tra đăng nhập
        let authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decode, "--------");
        if (!decode)
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });

        //kiểm tra quyền hạn
        let role = decode.roleId;
        if (role > 0)
            return res.status(400).json("Bạn không có quyền truy cập");
        req.user = await db.Users.findOne({
            where: { id: decode.id }
        });
        next();
    } catch (error) {
        console.log(error);
    }
};

let isManager = async (req, res, next) => {
    try {
        //check đăng nhập
        let authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return res.status(401).json({ message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục" });

        //check role (admin, author hay manager)
        let role = decode.roleId;
        if (role > 2)
            return res.status(400).json("Bạn không có quyền truy cập");

        //check quyền chỉnh sửa
        let check = await checkManagedStories(decode.id, req.query.id);
        if (!check)
            return res.status(400).json({ message: "Không tìm thấy sách hoặc không có quyền chỉnh sửa sách" });

        //gửi thông tin
        req.user = check.user;
        req.managedStories = check.managedStories;
        //console.log(req.user);
        next();
    } catch (error) {
        console.log(error);
    }
};

let checkManagedStories = async (userId, storyId) => {
    try {
        let user = await db.Users.findOne({
            where: { id: userId }
        });
        let managedStories = await user.getManaged();
        //console.log(managedStories);
        let findStory = managedStories.find(story => story.id === storyId);
        if (!findStory)
            return null;
        return { user: user, managedStories: managedStories };
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isAdmin,
    isAuthor,
    isManager
};