const paginate = require("express-paginate");

const db = require("../models/index.js");
const story_service = require("../services/story.service.js");
const { where, Op } = require("sequelize");

let postStory = async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body.title || !req.body.authorName || !req.body.genre)
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        let story = await db.Stories.findOne({
            where: {
                [Op.and]: [
                    { title: req.body.title },
                    { authorName: req.body.authorName }
                ]
            },
            attributes: ['id']
        });
        if (story)
            return res.status(400).json({ message: "Sách đã tồn tại" });
        await story_service.postStory(req.user.id, req.body);
        return res.status(200).json({ message: "Thêm sách mới thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let updateStory = async (req, res) => {
    try {
        let story = await db.Stories.findOne(
            {
                where: { id: req.params.storyId },
                attributes: ['title', 'authorName']
            }
        );
        //console.log(story);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await story_service.updateStory(req.body, req.params.storyId);
        return res.status(200).json({ message: "Cập nhật thông tin sách thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteStory = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId);
        //console.log(story);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await story_service.deleteStory(req.user, story);
        return res.status(200).json({ message: "Xóa sách thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getManagedStories = async (req, res) => {
    try {
        let managedStories = await req.user.getManaged();
        if (!managedStories)
            return res.status(400).json({ message: "Người dùng không quản lý sách nào" });
        return res.status(200).json({ managedStories: managedStories });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let addManager = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId);
        let newManager = await db.Users.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.usernameOrEmail },
                    { email: req.body.usernameOrEmail }
                ]
            }
        });
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        if (!newManager)
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        await story_service.addManager(newManager, story);
        return res.status(200).json({ message: "Thêm quản lý viên thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let deleteManager = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        let manager = await db.Users.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.usernameOrEmail },
                    { email: req.body.usernameOrEmail }
                ]
            }
        });
        if (!manager)
            return res.status(400).json({ message: "Không tìm thấy quản trị viên" });
        await story.removeManaged(manager);
        return res.status(200).json({ message: "Xóa quản trị viên thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let getStory = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        let [stories, totalStories] = await Promise.all([
            db.Stories.findAll(
                {
                    limit: limit,
                    offset: offset,
                    where: { isApproved: 1 },
                    attributes: ["title", "description", "genre", "authorName", "popular", "image", "id", "createdAt", "views"]
                }
            ),
            db.Stories.count()
        ]);

        if (!stories) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }

        // Tính toán thông tin pagination
        const totalPages = Math.ceil(totalStories / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            stories: stories,
            pagination: {
                currentPage: page,
                limit: limit,
                totalItems: totalStories,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let getAllStory = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        let [stories, totalStories] = await Promise.all([
            db.Stories.findAll(
                {
                    limit: limit,
                    offset: offset,
                }
            ),
            db.Stories.count()
        ]);

        if (!stories) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }

        // Tính toán thông tin pagination
        const totalPages = Math.ceil(totalStories / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            stories: stories,
            pagination: {
                currentPage: page,
                limit: limit,
                totalItems: totalStories,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let getStoryById = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId, {
            where: {
                isApproved: 1
            },
            include: [
                {
                    model: db.Users,
                    as: "Managed",
                    attributes: ["username"]
                },
                {
                    model: db.Chapters,
                    as: "Chapters",
                    attributes: ["id", "chapterNumber", "title", "createdAt", "isApproved"],
                    separate: true,
                    order: [['chapterNumber', 'ASC']] // Sắp xếp tăng dần
                }
            ],
            attributes: ['id', 'title', 'authorName', 'status', 'image', 'genre', 'description', 'createdAt']
        });

        let genre = await db.Genres.findOne({ where: { name: story.genre }, attributes: ['id'] });

        let comments = await db.Comments.findAll({
            where: {
                storyId: req.params.storyId,
                id: { [Op.ne]: 1 }
            },
            include: [
                {
                    model: db.Users,
                    as: 'Users',
                    attributes: ["username", "avatar"]
                }
            ]
        });

        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }

        return res.status(200).json({
            story: story,
            comments: comments,
            genre: genre
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

let getChapterByStory = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        if (res.user != null && res.user.roleId == 0) {
            let chapters = await story.getChapters();
        } else {
            let chapters = await story.getChapters({
                where: { isApproved: 1 }
            });
        }
        return res.status(200).json({ chapters: chapters, message: "Lấy danh sách chương thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

module.exports = {
    postStory,
    updateStory,
    getManagedStories,
    deleteStory,
    addManager,
    deleteManager,
    getStory,
    getAllStory,
    getChapterByStory,
    getStoryById
}