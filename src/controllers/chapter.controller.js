const { where, Op } = require('sequelize');
const db = require("../models/index.js");
const chapter_service = require("../services/chapter.service.js");
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

let postChapter = async (req, res) => {
    try {
        const { title, content } = req.body;
        const storyId = req.params.storyId;
        const file = req.file;

        if (!title || !storyId) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        // Kiểm tra story tồn tại
        const story = await db.Stories.findOne({ where: { id: storyId } });
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        await chapter_service.postChapter({ title, content, story, file });

        return res.status(201).json({
            message: "Tạo chương mới thành công",
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

let insertChapterAfter = async (req, res) => {
    try {
        const { title, content, afterChapterNumber } = req.body;
        const storyId = req.params.storyId;

        if (!title || !afterChapterNumber || !storyId) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        // Kiểm tra truyện tồn tại
        const story = await db.Stories.findByPk(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        const newChapterNumber = afterChapterNumber + 1;

        // Tăng số thứ tự các chương có chapterNumber >= newChapterNumber
        // await db.Chapters.increment(
        //     { chapterNumber: 1 },
        //     {
        //         where: {
        //             storyId,
        //             chapterNumber: {
        //                 [Op.gte]: newChapterNumber
        //             }
        //         }
        //     }
        // );

        // Thêm chương mới
        const newChapter = await db.Chapters.create({
            title,
            content,
            chapterNumber: newChapterNumber,
            storyId,
            isApproved: 0
        });

        return res.status(201).json({ message: "Chèn chương mới thành công", chapter: newChapter });
    } catch (error) {
        console.error("Lỗi khi chèn chương:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};


const jwt = require("jsonwebtoken");
require("dotenv").config();

let getChapter = async (req, res) => {
    try {
        let roleId = 1; // mặc định là user thường

        // Nếu có cookie chứa token
        const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            roleId = decoded.roleId; // bạn cần đảm bảo đã lưu roleId khi tạo token
        }

        const isAdmin = roleId === 0;

        // Lấy thông tin truyện
        let story = await db.Stories.findOne({
            where: {
                id: req.params.storyId,
                ...(isAdmin ? {} : { isApproved: 1 })
            },
            attributes: ["title", "lastestChapterId"]
        });

        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        // Lấy chương
        let chapter = await db.Chapters.findOne({
            where: {
                storyId: req.params.storyId,
                chapterNumber: req.params.chapterNumber,
                ...(isAdmin ? {} : { isApproved: 1 })
            },
            attributes: ['id', 'chapterNumber', 'title', 'content', 'storyId']
        });

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương sách" });
        }

        return res.status(200).json({ chapter, story });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};


let getAllChapters = async (req, res) => {
    try {
        const chapters = await db.Chapters.findAll({
            include: [{
                model: db.Stories,
                as: 'Story',
                attributes: ['id', 'title']
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ chapters });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getChapterById = async (req, res) => {
    try {
        if (res.user != null && res.user.roleId == 0) {
            const chapter = await db.Chapters.findByPk(req.params.chapterId, {
                include: [{
                    model: db.Stories,
                    as: 'story',
                    attributes: ['id', 'title']
                }],
            });
        }
        else {
            const chapter = await db.Chapters.findByPk(req.params.chapterId, {
                include: [{
                    model: db.Stories,
                    as: 'story',
                    attributes: ['id', 'title']
                }],
                where: { isApproved: 1 }
            });
        }
        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }
        return res.status(200).json({ chapter });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

module.exports = {
    postChapter,
    updateChapter,
    deleteChapter,
    getChapter,
    getAllChapters,
    getChapterById,
    insertChapterAfter
}