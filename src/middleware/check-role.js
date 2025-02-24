const jwt = require("jsonwebtoken");
const db = require("../models/index.js");
const { where } = require("sequelize");
require("dotenv").config();

let isAuthor = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decode, "--------");
        if(!decode)
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let role = decode.roleId;
        if(role > 1)
            return res.status(400).json("Bạn không có quyền truy cập");
        req.user = await db.Users.findOne({
            where: {id: decode.id}
        });
        next();
    } catch (error) {
        console.log(error);
    }
};

let isAdmin = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decode, "--------");
        if(!decode)
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let role = decode.roleId;
        if(role > 0)
            return res.status(400).json("Bạn không có quyền truy cập");
        req.user = await db.Users.findOne({
            where: {id: decode.id}
        });
        next();
    } catch (error) {
        console.log(error);
    }
};

let isManager = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decode, "--------");
        if(!decode)
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let role = decode.roleId;
        if(role > 1)
            return res.status(400).json("Bạn không có quyền truy cập");
        req.user = await db.Users.findOne({
            where: {id: decode.id}
        });
        next();
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    isAdmin,
    isAuthor,
    isManager
};