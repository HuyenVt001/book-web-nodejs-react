const { where, Op } = require('sequelize');
const db = require('../models/index.js');
const cloudinary = require("../config/cloudinary.js");

let getAllUsers = async (req, res) => {
    try {
        const users = await db.Users.findAll({
            attributes: ['id', 'username', 'email', 'isVerified', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ users: users });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getUserById = async (req, res) => {
    try {
        const user = await db.Users.findByPk(req.params.userId, {
            attributes: ['id', 'username', 'email', 'avatar', 'isVerified', 'createdAt']
        });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteUser = async (req, res) => {
    try {
        const user = await db.Users.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        await user.destroy();
        return res.status(200).json({ message: "Xóa người dùng thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Story Approval
let approveStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const { isApproved, reason } = req.body;

        const story = await db.Stories.findByPk(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        await story.update({
            isApproved: true
        });

        // Tạo thông báo cho tác giả
        let users = await story.getManaged();
        let notifications = users.map(user => ({
            userId: user.id,
            message: story.isApproved === true ? 'Truyện của bạn đã được phê duyệt' : 'Truyện của bạn đã bị từ chối',
            storyId: 1,
            chapterId: 1,
            content: story.isApproved === true
                ? `Truyện "${story.title}" của bạn đã được phê duyệt.`
                : `Truyện "${story.title}" của bạn đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể'}`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: isApproved ? "Phê duyệt truyện thành công" : "Từ chối truyện thành công",
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let approveChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { isApproved, reason } = req.body;

        const chapter = await db.Chapters.findByPk(chapterId, {
            include: [{
                model: db.Stories,
                as: 'Story'
            }]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        await chapter.update({
            isApproved: true
        });

        let users = await chapter.Story.getManaged();

        let notifications = await users.map(user => ({
            userId: user.id,
            title: chapter.isApproved === true ? 'Chương của bạn đã được phê duyệt' : 'Chương của bạn đã bị từ chối',
            storyId: 1,
            chapterId: 1,
            content: chapter.isApproved === true
                ? `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã được phê duyệt và đã được xuất bản.`
                : `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể'}`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: isApproved ? "Phê duyệt chương thành công" : "Từ chối chương thành công",
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getPendingStories = async (req, res) => {
    try {
        const stories = await db.Stories.findAll({
            where: {
                isApproved: false
            },
            include: [{
                model: db.Users,
                as: 'Users',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ stories });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getPendingChapters = async (req, res) => {
    try {
        const chapters = await db.Chapters.findAll({
            where: {
                isApproved: false
            },
            include: [{
                model: db.Stories,
                as: 'story',
                attributes: ['id', 'title'],
                include: [{
                    model: db.Users,
                    as: 'Users',
                    attributes: ['id', 'username']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ chapters });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,

    approveStory,
    approveChapter,
    getPendingStories,
    getPendingChapters
};
