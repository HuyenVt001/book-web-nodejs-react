const db = require("../models/index.js");
const { where, Op } = require("sequelize");
const cloudinary = require("../config/cloudinary.js");

let postStory = async (userId, data) => {
    try {
        let story = await db.Stories.create({
            title: data.title,
            authorName: data.authorName,
            description: data.description,
            status: "Đang ra",
            genre: data.genre,
            lastestChapterId: 0,
            isApproved: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        await updateAvatar(story.id, data.avatar == null ? "https://img.wattpad.com/d8fd5f22e982901feb717a73b614af6863a25c89/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f746a75514e5846754a72786c39513d3d2d3431323238353536302e313466373863306566343336636135333432383037323739353431352e6a7067" : data.avatar);
        let user = await db.Users.findOne({ where: { id: userId }, attributes: ['id', 'roleId'] });
        //console.log(user);
        if (user.roleId > 1) {
            await db.Users.update(
                { roleId: 1 },
                { where: { id: userId } }
            );
        }
        await story.addManaged(user);
        return story;
    } catch (error) {
        console.log(error);
    }
};

let updateStory = async (data, storyId) => {
    try {
        let story = await db.Stories.update(
            {
                title: data.title,
                authorName: data.authorName,
                description: data.description,
                status: data.status,
                genre: data.genre,
                isApproved: false,
                updatedAt: Date.now()
            },
            {
                where: { id: storyId }
            }
        );
        await updateAvatar(storyId, data.avatar);
        return story;
    } catch (error) {
        console.log(error);
    }
};

let updateAvatar = async (storyId, avatar) => {
    try {
        let uploadResponse = await cloudinary.uploader.upload(avatar, {
            folder: "stories",
            resource_type: "image"
        });
        await db.Stories.update(
            { image: uploadResponse.secure_url },
            { where: { id: storyId } }
        );
    } catch (error) {
        console.log(error);
    }
};

let deleteStory = async (user, story) => {
    try {
        await user.removeManaged(story);
        await db.Stories.destroy({
            where: { id: story.id }
        });
    } catch (error) {
        console.log(error);
    }
};

let addManager = async (user, story) => {
    try {
        if (user.roleId > 2) {
            await db.Users.update(
                { roleId: 2 },
                { where: { id: user.id } }
            );
        }
        await user.addManaged(story);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    postStory,
    updateStory,
    deleteStory,
    addManager,
}