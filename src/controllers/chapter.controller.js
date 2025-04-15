const { where, Op } = require('sequelize');
const db = require("../models/index.js");
const chapter_service = require("../services/chapter.service.js");
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

let postChapter = async (req, res) => {
    try {
        const { title, storyId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Vui lòng tải lên file" });
        }

        if (!title || !storyId) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        // Kiểm tra story tồn tại
        const story = await db.Stories.findByPk(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        // Kiểm tra chapter số đã tồn tại
        const lastChapter = await db.Chapters.findOne({
            where: { storyId },
            order: [['chapterNumber', 'DESC']]
        });

        const chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

        let content = '';
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Xử lý file dựa trên định dạng
        if (fileExtension === '.docx') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            content = result.value;
        } else if (fileExtension === '.txt') {
            content = file.buffer.toString('utf-8');
        } else {
            return res.status(400).json({ message: "Định dạng file không được hỗ trợ. Vui lòng tải lên file .docx hoặc .txt" });
        }

        // Tạo chapter mới
        const newChapter = await db.Chapters.create({
            title,
            content,
            chapterNumber,
            storyId
        });

        return res.status(201).json({
            message: "Tạo chương mới thành công",
            chapter: {
                id: newChapter.id,
                title: newChapter.title,
                chapterNumber: newChapter.chapterNumber,
                storyId: newChapter.storyId,
                status: newChapter.status,
                createdAt: newChapter.createdAt
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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