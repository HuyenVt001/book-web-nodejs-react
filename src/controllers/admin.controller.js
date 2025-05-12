const { where, Op } = require('sequelize');
const db = require('../models/index.js');
const cloudinary = require("../config/cloudinary.js");

let getAllUsers = async (req, res) => {
    try {
        const users = await db.Users.findAll({
            attributes: ['id', 'username', 'email', 'roleId', 'isVerified', 'createdAt'],
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

let addAdminRole = async (req, res) => {
    try {
        const user = await db.Users.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        await user.update(
            { roleId: 0 }
        )
        return res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let deleteAdminRole = async (req, res) => {
    try {
        const user = await db.Users.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        await user.update(
            { roleId: 3 }
        )
        return res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

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
            storyId: 1,
            chapterId: 1,
            message: story.isApproved === true
                ? `Truyện "${story.title}" của bạn đã được phê duyệt.`
                : `Truyện "${story.title}" của bạn đã bị từ chối.`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: "Phê duyệt truyện thành công",
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let dropStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;

        const story = await db.Stories.findByPk(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        await story.update({
            isApproved: false
        });

        // Tạo thông báo cho tác giả
        let users = await story.getManaged();
        let notifications = users.map(user => ({
            userId: user.id,
            storyId: 1,
            chapterId: 1,
            message: story.isApproved === true
                ? `Truyện "${story.title}" của bạn đã được phê duyệt.`
                : `Truyện "${story.title}" của bạn đã bị từ chối.`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: "Từ chối truyện thành công",
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let approveChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;

        const chapter = await db.Chapters.findByPk(chapterId, {
            include: [{
                model: db.Stories,
                as: 'Story'
            }]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        const t = await db.sequelize.transaction();

        try {
            const story = chapter.Story;

            // Nếu chèn vào giữa
            if (chapter.chapterNumber < story.latestChapterId) {
                // Tăng chapterNumber của các chương sau
                await db.Chapters.increment(
                    { chapterNumber: 1 },
                    {
                        where: {
                            storyId: chapter.storyId,
                            isApproved: true,
                            chapterNumber: {
                                [Op.gt]: chapter.chapterNumber
                            }
                        },
                        transaction: t
                    }
                );
            }

            // Cập nhật chapter thành đã duyệt
            await chapter.update(
                { isApproved: true },
                { transaction: t }
            );

            // Nếu cần, cập nhật lại story.latestChapterId nếu đây là chương mới nhất
            if (chapter.chapterNumber >= story.latestChapterId) {
                await story.update(
                    { latestChapterId: chapter.chapterNumber },
                    { transaction: t }
                );
            }

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }

        let users = await chapter.Story.getManaged();

        let notifications = await users.map(user => ({
            userId: user.id,
            storyId: 1,
            chapterId: 1,
            message: chapter.isApproved === true
                ? `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã được phê duyệt và đã được xuất bản.`
                : `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã bị từ chối.`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: "Phê duyệt chương thành công",
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let dropChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;

        const chapter = await db.Chapters.findByPk(chapterId, {
            include: [{
                model: db.Stories,
                as: 'Story'
            }]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        const t = await db.sequelize.transaction();

        try {
            const story = chapter.Story;

            if (chapter.chapterNumber < story.latestChapterId) {
                // Tăng chapterNumber của các chương sau
                await db.Chapters.decrement(
                    { chapterNumber: 1 },
                    {
                        where: {
                            storyId: chapter.storyId,
                            isApproved: true,
                            chapterNumber: {
                                [Op.gt]: chapter.chapterNumber
                            }
                        },
                        transaction: t
                    }
                );
                await story.update(
                    { latestChapterId: chapter.chapterNumber },
                    { transaction: t }
                );
            }

            // Cập nhật chapter thành đã duyệt
            await chapter.update(
                { isApproved: false },
                { transaction: t }
            );

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }

        let users = await chapter.Story.getManaged();

        let notifications = await users.map(user => ({
            userId: user.id,
            storyId: 1,
            chapterId: 1,
            message: chapter.isApproved === true
                ? `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã được phê duyệt và đã được xuất bản.`
                : `Chương "${chapter.title}" của truyện "${chapter.Story.title}" đã bị từ chối.`,
            isRead: false
        }));

        await db.Notifications.bulkCreate(notifications);

        return res.status(200).json({
            message: "Từ chối chương thành công",
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
    addAdminRole,
    deleteAdminRole,
    deleteUser,

    approveStory,
    dropStory,
    approveChapter,
    dropChapter,
    getPendingStories,
    getPendingChapters
};
