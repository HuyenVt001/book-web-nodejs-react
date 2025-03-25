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
            }
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
        let story = await db.Stories.findByPk(req.params.storyId);
        //console.log(story);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await story_service.updateStory(req.body, story);
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

        // tìm sách và count tổng số comments
        let [story, totalComments] = await Promise.all([
            db.Stories.findByPk(req.params.storyId, {
                include: [
                    { model: db.Genres, attributes: ["name"] }, // lấy thể loại
                    { model: db.Users, as: "Managed", attributes: ["username"] }, // lấy người quản lý
                    { model: db.Chapters, attributes: ["chapterNumber", "title"] }, // lấy các chương
                    {
                        model: db.Comments, // lấy bình luận
                        include: {
                            model: db.Users,
                            attributes: ["username"]
                        },
                        attributes: ["content", "updatedAt"],
                        limit: limit,
                        offset: offset,
                        order: [['updatedAt', 'DESC']] // Sắp xếp comment mới nhất lên đầu
                    }
                ]
            }),
            db.Comments.count({
                where: { storyId: req.params.storyId }
            })
        ]);

        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }

        // Tính toán thông tin pagination
        const totalPages = Math.ceil(totalComments / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            story: story,
            pagination: {
                currentPage: page,
                limit: limit,
                totalItems: totalComments,
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

let getChapterByStory = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.params.storyId);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        let chapters = await story.getChapters();
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
    getChapterByStory
}