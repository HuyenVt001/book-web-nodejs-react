const { where } = require("sequelize");
const db = require("../models/index.js");
const chapter_service = require("../services/chapter.service.js");

let postChapter = async (req, res) => {
    try {
        let title = req.body.title;
        let content = req.body.content;
        let storyId = req.params.storyId;
        if (!title || !content)
            return res.status(400).json({ message: "Thiếu các thông tin cần thiết" });
        let story = await db.Stories.findByPk(storyId);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await chapter_service.postChapter(story, { title: title, content: content });
        return res.status(200).json({ message: "Thêm chương mới thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let updateChapter = async (req, res) => {
    try {
        let chapter = await db.Chapters.findOne({
            where: {
                storyId: req.params.storyId,
                chapterNumber: req.params.chapterNumber
            }
        });
        if (!chapter)
            return res.status(400).json({ message: "Không tìm thấy chương sách" });
        await chapter_service.updateChapter(req.body, chapter);
        return res.status(200).json({ message: "Cập nhật chương thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let deleteChapter = async (req, res) => {
    try {
        let chapter = await db.Chapters.findOne({
            where: {
                storyId: req.params.storyId,
                chapterNumber: req.params.chapterNumber
            }
        });
        if (!chapter)
            return res.status(400).json({ message: "Không tìm thấy chương sách" });
        await db.Chapters.destroy({
            where: {
                storyId: req.params.storyId,
                chapterNumber: req.params.chapterNumber
            }
        });
        return res.status(200).json({ message: "Xóa chương thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let getChapter = async (req, res) => {
    try {
        let story = await db.Stories.findOne(
            {
                where: { id: req.params.storyId },
                attributes: ["title", "lastestChapterId"]
            }
        )
        let chapter = await db.Chapters.findOne(
            {
                where: {
                    storyId: req.params.storyId,
                    chapterNumber: req.params.chapterNumber
                },
                attributes: ['id', 'chapterNumber', 'title', 'content', 'storyId']
            }
        );
        if (!chapter)
            return res.status(400).json({ message: "Không tìm thấy chương sách" });
        return res.status(200).json({ chapter: chapter, story: story });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

module.exports = {
    postChapter,
    updateChapter,
    deleteChapter,
    getChapter
}