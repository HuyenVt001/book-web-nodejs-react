const { where } = require("sequelize");
const db = require("../models/index.js");

let postChapter = async (data) => {
    try {
        let { title, content, story, file } = data;
        let storyId = story.id;

        const chapterNumber = story.lastestChapterId + 1;

        let fileContent = '';
        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();

            // Xử lý file dựa trên định dạng
            if (fileExtension === '.docx') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                fileContent = result.value;
            } else if (fileExtension === '.txt') {
                fileContent = file.buffer.toString('utf-8');
            } else {
                return res.status(400).json({ message: "Định dạng file không được hỗ trợ. Vui lòng tải lên file .docx hoặc .txt" });
            }
        }

        // Tạo chapter mới
        const newChapter = await db.Chapters.create({
            title,
            chapterNumber,
            content: fileContent ? fileContent : content,
            storyId,
            views: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isApproved: false
        });

        await db.Stories.update(
            { lastChapterId: chapterNumber },
            { where: { id: story.id } }
        )
        // Gửi thông báo
        let findStory = db.Stories.findByPk(story.id, {
            include: { model: db.Users, as: "Favorites" }
        });
        if (findStory.Favorites === null) {
            return;
        }
        let notifications = story.Favorites.map(user => ({
            userId: user.id,
            message: `Sách ${story.title} có chương mới: ${newChapter.title}`,
            isRead: false,
            link: `http://${process.env.HOST}:${process.env.PORT}/chapter/${storyId}/${newChapter.chapterNumber}`
        }));

        await db.Notifications.bulkCreate(notifications);
    } catch (error) {
        console.log(error);
    }
}

let updateChapter = async (data, oldData) => {
    try {
        let fileContent = '';
        if (data.file) {
            const fileExtension = path.extname(file.originalname).toLowerCase();

            // Xử lý file dựa trên định dạng
            if (fileExtension === '.docx') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                fileContent = result.value;
            } else if (fileExtension === '.txt') {
                fileContent = file.buffer.toString('utf-8');
            } else {
                return res.status(400).json({ message: "Định dạng file không được hỗ trợ. Vui lòng tải lên file .docx hoặc .txt" });
            }
        }
        let content = fileContent ? fileContent : data.content;
        await db.Chapters.update(
            {
                title: data.title == null ? oldData.title : data.title,
                content: content == null ? oldData : data.content,
                isApproved: false,
                updatedAt: Date.now()
            },
            { where: { id: oldData.id } }
        );
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    postChapter,
    updateChapter
}