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

let updateUser = async (req, res) => {
    try {
        const { username, email, isVerified } = req.body;
        const user = await db.Users.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Kiểm tra username hoặc email đã tồn tại chưa
        if (username || email) {
            const existingUser = await db.Users.findOne({
                where: {
                    [Op.or]: [
                        { username: username || user.username },
                        { email: email || user.email }
                    ],
                    id: { [Op.ne]: user.id }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: "Username hoặc email đã tồn tại" });
            }
        }

        await user.update({
            username: username || user.username,
            email: email || user.email,
            isVerified: isVerified !== undefined ? isVerified : user.isVerified
        });

        return res.status(200).json({ message: "Cập nhật thông tin người dùng thành công" });
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

let getAllStories = async (req, res) => {
    try {
        const stories = await db.Stories.findAll({
            include: [{
                model: db.Users,
                as: 'author',
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

let getStoryById = async (req, res) => {
    try {
        const story = await db.Stories.findByPk(req.params.storyId, {
            include: [{
                model: db.Users,
                as: 'author',
                attributes: ['id', 'username']
            }]
        });
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }
        return res.status(200).json({ story });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let updateStory = async (req, res) => {
    try {
        const { title, description, coverImage, status } = req.body;
        const story = await db.Stories.findByPk(req.params.storyId);

        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        let coverImageUrl = story.coverImage;
        if (coverImage) {
            const uploadResponse = await cloudinary.uploader.upload(coverImage, {
                folder: "stories",
                resource_type: "image"
            });
            coverImageUrl = uploadResponse.secure_url;
        }

        await story.update({
            title: title || story.title,
            description: description || story.description,
            coverImage: coverImageUrl,
            status: status || story.status
        });

        return res.status(200).json({ message: "Cập nhật truyện thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteStory = async (req, res) => {
    try {
        const story = await db.Stories.findByPk(req.params.storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        await story.destroy();
        return res.status(200).json({ message: "Xóa truyện thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getAllChapters = async (req, res) => {
    try {
        const chapters = await db.Chapters.findAll({
            include: [{
                model: db.Stories,
                as: 'story',
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
        const chapter = await db.Chapters.findByPk(req.params.chapterId, {
            include: [{
                model: db.Stories,
                as: 'story',
                attributes: ['id', 'title']
            }]
        });
        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }
        return res.status(200).json({ chapter });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let updateChapter = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const chapter = await db.Chapters.findByPk(req.params.chapterId);

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        await chapter.update({
            title: title || chapter.title,
            content: content || chapter.content,
            status: status || chapter.status
        });

        return res.status(200).json({ message: "Cập nhật chương thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteChapter = async (req, res) => {
    try {
        const chapter = await db.Chapters.findByPk(req.params.chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        await chapter.destroy();
        return res.status(200).json({ message: "Xóa chương thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getAllComments = async (req, res) => {
    try {
        const comments = await db.Comments.findAll({
            include: [
                {
                    model: db.Users,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: db.Stories,
                    as: 'story',
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ comments });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getCommentById = async (req, res) => {
    try {
        const comment = await db.Comments.findByPk(req.params.commentId, {
            include: [
                {
                    model: db.Users,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: db.Stories,
                    as: 'story',
                    attributes: ['id', 'title']
                }
            ]
        });
        if (!comment) {
            return res.status(404).json({ message: "Không tìm thấy bình luận" });
        }
        return res.status(200).json({ comment });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let updateComment = async (req, res) => {
    try {
        const { content, status } = req.body;
        const comment = await db.Comments.findByPk(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: "Không tìm thấy bình luận" });
        }

        await comment.update({
            content: content || comment.content,
            status: status || comment.status
        });

        return res.status(200).json({ message: "Cập nhật bình luận thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteComment = async (req, res) => {
    try {
        const comment = await db.Comments.findByPk(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Không tìm thấy bình luận" });
        }

        await comment.destroy();
        return res.status(200).json({ message: "Xóa bình luận thành công" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Story Approval
let approveStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { isApproved, reason } = req.body;

        const story = await db.Stories.findByPk(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy truyện" });
        }

        await story.update({
            isApproved,
            status: isApproved ? 'published' : 'rejected'
        });

        // Tạo thông báo cho tác giả
        await db.Notifications.create({
            userId: story.authorId,
            type: 'story_approval',
            title: isApproved ? 'Truyện của bạn đã được phê duyệt' : 'Truyện của bạn đã bị từ chối',
            content: isApproved
                ? `Truyện "${story.title}" của bạn đã được phê duyệt và đã được xuất bản.`
                : `Truyện "${story.title}" của bạn đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể'}`,
            isRead: false
        });

        return res.status(200).json({
            message: isApproved ? "Phê duyệt truyện thành công" : "Từ chối truyện thành công",
            story: {
                id: story.id,
                title: story.title,
                isApproved: story.isApproved,
                status: story.status
            }
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
                as: 'story',
                attributes: ['id', 'title', 'authorId']
            }]
        });

        if (!chapter) {
            return res.status(404).json({ message: "Không tìm thấy chương" });
        }

        await chapter.update({
            isApproved,
            status: isApproved ? 'published' : 'rejected'
        });

        await db.Notifications.create({
            userId: chapter.story.authorId,
            type: 'chapter_approval',
            title: isApproved ? 'Chương của bạn đã được phê duyệt' : 'Chương của bạn đã bị từ chối',
            content: isApproved
                ? `Chương "${chapter.title}" của truyện "${chapter.story.title}" đã được phê duyệt và đã được xuất bản.`
                : `Chương "${chapter.title}" của truyện "${chapter.story.title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể'}`,
            isRead: false
        });

        return res.status(200).json({
            message: isApproved ? "Phê duyệt chương thành công" : "Từ chối chương thành công",
            chapter: {
                id: chapter.id,
                title: chapter.title,
                isApproved: chapter.isApproved,
                status: chapter.status
            }
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
                as: 'author',
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
                    as: 'author',
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
    updateUser,
    deleteUser,

    getAllStories,
    getStoryById,
    updateStory,
    deleteStory,

    getAllChapters,
    getChapterById,
    updateChapter,
    deleteChapter,

    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,

    approveStory,
    approveChapter,
    getPendingStories,
    getPendingChapters
};
