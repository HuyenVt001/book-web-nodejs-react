const db = require("../models/index.js");
const { where, Op } = require("sequelize");
const cloudinary = require("../config/cloudinary.js");

let postStory = async (data) => {
    try {
        let content = `Đây là tác phẩm ${data.title} của tác giả ${data.authorName}`;
        let story = await db.Stories.create({
            title: data.title,
            authorName: data.authorName,
            description: data.description == null ? content : data.description,
            statusId: 1,
            lastestChapterId: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        await updateAvatar(story.id, "https://img.wattpad.com/d8fd5f22e982901feb717a73b614af6863a25c89/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f746a75514e5846754a72786c39513d3d2d3431323238353536302e313466373863306566343336636135333432383037323739353431352e6a7067");
        return story;
    } catch (error) {
        console.log(error);
    }
}

let updateStory = async (data, oldData) => {
    try {
        let story = await db.Stories.update(
            {
                title: data.title == null ? oldData.title : data.title,
                authorName: data.authorName == null ? oldData.authorName : data.authorName,
                description: data.description == null ? oldData.description : data.description,
                statusId: data.statusId == null ? oldData.statusId : data.statusId,
                lastestChapterId: data.lastestChapterId == null ? oldData.lastestChapterId : data.lastestChapterId,
                updatedAt: Date.now()
            },
            {
                where: {id: oldData.id}
            }
        );
        return story;
    } catch (error) {
        console.log(error);
    }
}

let updateAvatar = async (storyId, avatar) => {
    try {
        let uploadResponse = await cloudinary.uploader.upload(avatar, {
            folder: "stories",
            resource_type: "image"
        })
        await db.Stories.update(
            {image: uploadResponse.secure_url},
            {where: {id: storyId}}
        )
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    postStory,
    updateStory,
    updateAvatar
}