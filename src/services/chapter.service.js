const db = require("../models/index.js");

let postChapter = async (story, data) => {
    // Nhập dữ liệu
    try {
        let chapter = await db.Chapters.create({
            title: data.title,
            content: data.content,
            storyId: story.id,
            views: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        // Gửi thông báo
        let findStory = db.Stories.findByPk(story.id, {
            include: { model: db.Users, as: "Favorites" }
        });
        if (findStory.Favorites.length === 0) {
            return;
        }
        let notifications = story.Favorites.map(user => ({
            userId: user.id,
            message: `Sách ${story.title} có chương mới: ${chapter.title}`,
            isRead: false,
            link: `http://${process.env.HOST}:${process.env.PORT}/api/chapter/get-chapter?chapterId=${chapter.id}`
        }));

        await db.Notifications.bulkCreate(notifications);
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