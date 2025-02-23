const bcrypt = require("bcrypt");
const db = require("../models/index.js");
const { where } = require("sequelize");

const salt = 10;

let hashPassword = async (password) => {
    try {
        var hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (e) {
        console.log("Error: ", e);
    }
};

let createNewUser = async (data) => {
    try {
        let hashedPassword = await hashPassword(data.password); 
        let newUser = await db.Users.create({
            username: data.username,
            password: hashedPassword,
            email: data.email,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        return newUser; 
    } catch (error) {
        console.error("Error creating user:", error);
    }
};

let getUserByUsernameAndPassword = async (data) => {
    try {
        let user = await db.Users.findOne({
            where: {username: data.username}
        });
        if(!user){
            return 0;
        }
        let isPasswordCorrect = bcrypt.compare(data.password, user.password);
        if(!isPasswordCorrect) return 1;
        return user;
    } catch (error) {
        console.log("Error: ", error);
    }
};

module.exports = {
    createNewUser,
    getUserByUsernameAndPassword
}