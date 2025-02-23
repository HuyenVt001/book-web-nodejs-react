const { where } = require('sequelize');
const jwt = require("jsonwebtoken");
const db = require('../models/index.js');
const { 
    createNewUser,
    getUserByUsernameAndPassword
} = require('../services/auth.service.js');
const auth_utils = require('../utils/auth.util.js');

let signup = async (req, res) => {
    const {username, password, email} = req.body;
    console.log(req.body);
    try {
        if(!username || !password || !email)
            return res.status(400).json({message: "Thiếu các trường cần thiết"});
        let userByUsername = await db.Users.findOne({where: {username}});
        let userByEmail = await db.Users.findOne({where: {email}});
        if(userByUsername) 
            return res.status(400).json({message: "Username đã tồn tại"});
        if(userByEmail) 
            return res.status(400).json({message: "Email đã được sử dụng"});
        if(password.length < 6) 
            return res.status(400).json({message: "Mật khẩu phải chứa ít nhất 6 ký tự"});
        let newUser = await createNewUser({username, password, email});
        await auth_utils.sendVerificationMail(email);
        return res.status(200).json("Mail xác thực đã được gửi về email của bạn! Vui lòng xác thực tài khoản.");
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let signin = async (req, res) => {
    const {username, password} = req.body;
    try {
        if(!username || !password)
            return res.status(400).json({message: "Thiếu các trường cần thiết"});
        let user = getUserByUsernameAndPassword(req.body);
        if(user==0)
            return res.status(400).json("Người dùng không tồn tại");
        if(user==1)
            return res.status(400).json({message: "Mật khẩu không chính xác"});
        const token = auth_utils.generateToken(user, res);
        return res.status(200).json({message: "Đăng nhập thành công"});
    } catch (error) {
        console.log("Error: ", error);
    }
};

let verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        await db.Users.update(
            {isVerified: true}, 
            {where: {email: decoded.email}}
        );
        res.send("Xác thực tài khoản thành công! Bạn có thể đăng nhập.");
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "Token không hợp lệ hoặc đã hết hạn."});
    }
};

module.exports = {
    signup,
    signin,
    verifyEmail
}