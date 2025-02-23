const jwt = require("jsonwebtoken");
const db = require("../models/index.js");
const { where } = require("sequelize");
require("dotenv").config();

let checkLogin = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let token = authHeader.replace("Bearer ", "");
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode, "--------");
        if(!decode)
            return res.status(401).json({message: "Người dùng chưa đăng nhập! Vui lòng đăng nhập để tiếp tục"});
        let user = await db.Users.findOne({ where: {id: decode.id}});
        if(!user)
            return res.status(404).json({message: "Không tìm thấy người dùng"});
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }
};

module.exports = checkLogin;