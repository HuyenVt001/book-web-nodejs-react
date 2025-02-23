const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
    },
});

let generateToken = (user, res) => {
    try {
        const token = jwt.sign(
            { userId: user.id, 
            role: user.role || "user" 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            sameSite: "strict", 
            secure: process.env.NODE_ENV !== "development", 
        });
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
};

let sendVerificationMail = async (email) => {
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const verificationLink = `http://${process.env.HOST}:${process.env.PORT}/api/auth/verify-email?token=${verificationToken}`;
    //console.log(verificationLink);
    await transporter.sendMail({
        from: `<${process.env.EMAIL_ACCOUNT}>`,
        to: email,
        subject: "Xác nhận đăng ký",
        text: `Vui lòng nhấn vào link sau để xác nhận tài khoản: ${verificationLink}`,
        html: `<p>Vui lòng nhấn vào link sau để xác nhận tài khoản:</p><a href="${verificationLink}">Xác nhận email</a>`,
    });
}

let deleteUserAfterTime = async (userId, delay) => {
    setTimeout(async () => {
        try {
            await Users.destroy({ where: { id: userId } });
            console.log(`User với ID ${userId} đã bị xóa.`);
        } catch (error) {
            console.error("Lỗi khi xóa user:", error);
        }
    }, delay);
};

module.exports = {
    generateToken,
    sendVerificationMail,
    deleteUserAfterTime
}
