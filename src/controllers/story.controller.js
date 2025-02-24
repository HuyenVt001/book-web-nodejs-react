const db = require("../models/index.js");
const story_service = require("../services/story.service.js");
const auth_service = require("../services/auth.service.js");
const { where, Op } = require("sequelize");

let postStory = async (req, res) => {
    try {
        console.log(req.body);
        if(!req.body.title || !req.body.authorName)
            return res.status(400).json({message: "Thiếu thông tin bắt buộc"});
        let story = await db.Stories.findOne({
            where: {
                [Op.and]: [
                    {title: req.body.title},
                    {authorName: req.body.authorName}
                ]
            }
        });
        if(story)
            return res.status(400).json({message: "Sách đã tồn tại"});
        await story_service.postStory(req.user.id, req.body);
        return res.status(200).json({message: "Thêm sách mới thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let updateStory = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.query.id);
        //console.log(story);
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        await story_service.updateStory(req.body, story);
        return res.status(200).json({message: "Cập nhật thông tin sách thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let deleteStory = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.query.id);
        //console.log(story);
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        await story_service.deleteStory(req.user, story);
        return res.status(200).json({message: "Xóa sách thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let updateImage = async (req, res) => {
    try {
        let avatar = req.body.avatar;
        if(!avatar)
            return res.status(400).json({ message: "Yêu cầu ảnh bìa" });
        let story = await db.Stories.findByPk(req.query.id);
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        await story_service.updateAvatar(storyId, avatar);
        return res.status(200).json({message: "Thay đổi ảnh bìa thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let getInfo = async (req, res) => {
    try {
        let storyId = req.query.id;
        let story = await db.Stories.findByPk(storyId);
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        return res.status(200).send(story);
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
};

let addManager = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.query.id);
        let newManager = await db.Users.findOne({
            where: {
                [Op.or]: [
                    {username: req.body.usernameOrEmail},
                    {email: req.body.usernameOrEmail}
                ]
            }
        });
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        if(!newManager)
            return res.status(400).json({message: "Không tìm thấy người dùng"});
        await story_service.addManager(newManager, story);
        return res.status(200).json({message: "Thêm quản lý viên thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
}

let deleteManager = async (req, res) => {
    try {
        let story = await db.Stories.findByPk(req.query.id);
        if(!story)
            return res.status(400).json({message: "Không tìm thấy sách"});
        let manager = await db.Users.findOne({
            where: {
                [Op.or]: [
                    {username: req.body.usernameOrEmail},
                    {email: req.body.usernameOrEmail}
                ]
            }
        });
        if(!manager)
            return res.status(400).json({message: "Không tìm thấy quản trị viên"});
        await story.removeManaged(manager);
        return res.status(200).json({message: "Xóa quản trị viên thành công"});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message: "Lỗi máy chủ nội bộ"});
    }
}

module.exports = {
    postStory,
    updateStory,
    updateImage,
    deleteStory,
    getInfo,
    addManager,
    deleteManager
}