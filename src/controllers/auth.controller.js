const { where, Op } = require('sequelize');
const jwt = require("jsonwebtoken");

const db = require('../models/index.js');
const auth_services = require('../services/auth.service.js');
const auth_utils = require('../utils/auth.util.js');
const cloudinary = require("../config/cloudinary.js");

let signup = async (req, res) => {
    const {username, password, email} = req.body;
    //console.log(req.body);
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
        let newUser = await auth_services.createNewUser({username, password, email});
        await auth_utils.sendVerificationMail(id, email);
        return res.status(200).json("Mail xác thực đã được gửi về email của bạn! Vui lòng xác thực tài khoản.");
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let signin = async (req, res) => {
    const {usernameOrEmail, password} = req.body;
    try {
        if(!usernameOrEmail || !password)
            return res.status(400).json({message: "Thiếu các trường cần thiết"});
        let user = await auth_services.getUserByUsernameOrEmailAndPassword(req.body);
        if(user==0)
            return res.status(400).json("Người dùng không tồn tại");
        if(user==1)
            return res.status(400).json({message: "Mật khẩu không chính xác"});
        if(!user.isVerified)
            return res.status(400).json({message: "Tài khoản chưa được xác thực"});
        const token = await auth_utils.generateToken(user, res);
        //console.log(user);
        //console.log(token);
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
            {where: {id: decoded.id}}
        );
        res.send("Xác thực tài khoản thành công! Bạn có thể đăng nhập.");
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "Token không hợp lệ hoặc đã hết hạn."});
    }
};

let resetPassword = async (req, res) => {
    try {
        let user = await db.Users.findOne({
            where: {
                [Op.or]: [
                    {username: req.body.usernameOrEmail},
                    {email: req.body.usernameOrEmail}
                ]
            }
        });
        if(!user)
            return res.status(400).json("Người dùng không tồn tại");
        //console.log(user.id, user.email);
        let randomPassword = Math.random().toString(36).substring(2, 11);
        let hashedPassword = await auth_services.hashPassword(randomPassword);
        //console.log(hashedPassword);
        await db.Users.update(
            {password: hashedPassword},
            {where: {id: user.id}}
        )
        auth_utils.sendResetPasswordMail(user.id, user.email, randomPassword);
        return res.status(200).json({message: "Mật khẩu mới đã được gửi về email"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let updateUsername = async (req, res) => {
    try {
        let user = await db.Users.findOne({
            where: {username: req.body.newUsername}
        })
        if(user)
            return res.status(400).json({message: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác"});
        await db.Users.update(
            {username: req.body.newUsername},
            {where: {id: req.user.id}}
        )
        return res.status(200).json({message: "Cập nhật thành công"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
}

let updateAvatar = async (req, res) => {
    try {
        let avatar = req.body.avatar;
        if(!avatar)
            return res.status(400).json({ message: "Yêu cầu avatar" });
        let uploadResponse = await cloudinary.uploader.upload(avatar, {
            folder: "users",
            resource_type: "image"
        })
        await db.Users.update(
            {avatar: uploadResponse.secure_url},
            {where: {id: req.user.id}}
        )
        return res.status(200).json({message: "Thay đổi ảnh đại diện thành công"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
}

let updatePassword = async (req, res) => {
    try {
        let check = await auth_services.checkPassword(req.body.password, req.user.password);
        if(!check)
            return res.status(401).json({message: "Mật khẩu không chính xác"});
        await db.Users.update(
            {password: await auth_services.hashPassword(req.body.newPassword)},
            {where: {id: req.user.id}}
        )
        return res.status(200).json({message: "Cập nhật thành công"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi máy chủ nội bộ"});
    }
}

module.exports = {
    signup,
    signin,
    verifyEmail,
    resetPassword,
    updateAvatar,
    updatePassword,
    updateUsername
}