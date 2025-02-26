const db = require("../models/index.js");

let postChapter = async (story, data) => {
    try {
        await db.Chapters.create({
            title: data.title,
            content: data.content,
            storyId: story.id,
            views: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    } catch (error) {
        console.log(error);
    }
}

let updateChapter = async (data, oldData) => {
    try {
        await db.Chapters.update({
            title: data.title == null ? oldData.title : data.title,
            content: data.content == null ? oldData : data.content,
            updatedAt: Data.now()
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    postChapter,
    updateChapter
}