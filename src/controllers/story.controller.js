const paginate = require("express-paginate");

const db = require("../models/index.js");
const story_service = require("../services/story.service.js");
const { where, Op } = require("sequelize");

let postStory = async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body.title || !req.body.authorName || !req.body.listGenres)
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
        await story_service.postStory(req.user.id, req.body, req.body.listGenres);
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

let updateImage = async (req, res) => {
    try {
        let avatar = req.body.avatar;
        if (!avatar)
            return res.status(400).json({ message: "Yêu cầu ảnh bìa" });
        let story = await db.Stories.findByPk(req.params.storyI);
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await story_service.updateAvatar(story.id, avatar);
        return res.status(200).json({ message: "Thay đổi ảnh bìa thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let updateGenre = async (req, res) => {
    try {
        let listGenres = req.body.listGenres;
        if (!listGenres)
            return res.status(400).json({ message: "Yêu cầu chọn các thể loại" });
        let story = await db.Stories.findByPk(req.params.storyId, { include: { model: db.Genres } });
        if (!story)
            return res.status(400).json({ message: "Không tìm thấy sách" });
        await story_service.updateGenre(story, listGenres);
        return res.status(200).json({ message: "Cập nhật thể loại thành công" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getManagedStories = async (req, res) => {
    try {
        let managedStories = req.managedStories;
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
        // tìm sách
        let story = await db.Stories.findByPk(req.params.storyId,
            {
                include: [
                    { model: db.Genres, attributes: ["name"] },
                    { model: db.Users, as: "Managed", attributes: ["username"] },
                    {
                        model: db.Comments,
                        include: {
                            model: db.Users,
                            attributes: ["username", "content", "updatedAt"]
                        }
                    }
                ]
            }
        );
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy sách" });
        }

        // lấy thông tin các chương và phân trang
        let page = parseInt(req.params.page) || 1;
        if (page < 1) page = 1;
        let limit = 50;
        let offset = (page - 1) * 50;
        let { count, rows: chapters } = await db.Chapters.findAndCountAll({
            where: { storyId: req.params.storyId },
            attributes: ["chapterNumber", "title", "createdAt"],
            limit: limit,
            offset: offset,
            order: [["createdAt", "ASC"]]
        });
        let pageCount = Math.max(Math.ceil(count / limit), 1);

        return res.status(200).json({
            story: story,
            chapters: chapters,
            pagination: {
                currentPage: page,
                totalPages: pageCount,
                totalChapters: count,
                pageSize: limit,
                hasNextPage: page < pageCount
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
}

module.exports = {
    postStory,
    updateStory,
    updateImage,
    getManagedStories,
    updateGenre,
    deleteStory,
    addManager,
    deleteManager,
    getStory
}