const bcrypt = require("bcrypt");
const db = require("../models/index.js");
const { where, Op } = require("sequelize");

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

let getUserByUsernameOrEmailAndPassword = async (data) => {
    try {
        let user = await db.Users.findOne({
            where: {
                [Op.or]: [
                    { username: data.usernameOrEmail },
                    { email: data.usernameOrEmail }
                ]
            }
        });
        return user;
    } catch (error) {
        console.log("Error: ", error);
    }
};

let checkPassword = async (passEnter, passDb) => {
    try {
        if (passEnter && passDb)
            return await bcrypt.compare(passEnter, passDb);
        else {
            console.log(passEnter, passDb);
        }
    } catch (error) {
        console.log(error);
    }
}

let postComment = async (user, story, content) => {
    try {
        await db.Comments.create({
            userId: user.id,
            storyId: story.id,
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    hashPassword,
    createNewUser,
    getUserByUsernameOrEmailAndPassword,
    checkPassword,
    postComment
}