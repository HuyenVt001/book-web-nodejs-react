const { hasNextPages } = require("express-paginate");
const db = require("../models/index.js");
const { Op, or, where } = require("sequelize");

let searchByKeyword = async (req, res) => {
    try {
        let keyword = req.body.keyword;
        let page = req.params.page || 1;
        let limit = 30;
        if (page < 1) page = 1;
        let offset = (page - 1) * 30;
        let sortOption = req.params.order === "updatedAt" ? ["updatedAt", "DESC"] : ["views", "DESC"];
        if (!keyword)
            return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });

        let { count, rows: stories } = await db.Stories.findAll(
            {
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${keyword}%` } },
                        { authorName: { [Op.like]: `%${keyword}%` } }
                    ],
                    isApproved: 1
                }
            },
            {
                limit: limit,
                offset: offset,
                order: [sortOption]
            }
        );
        let totalPages = Math.max(Math.ceil(count / limit), 1);

        return res.status(200).json({
            stories: stories,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalStories: count,
                pageSize: limit,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let searchByGenre = async (req, res) => {
    try {
        let page = req.params.page || 1;
        let limit = 30;
        if (page < 1) page = 1;
        let offset = (page - 1) * 30;
        let genre = await db.Genres.findByPk(req.params.genreId);
        let sortOption = req.params.order === "views" ? ["updatedAt", "DESC"] : ["views", "DESC"];

        if (!genre)
            return res.status(400).json({ message: "Thể loại không tồn tại" });
        let [stories, count] = await Promise.all([
            db.Stories.findAll({
                where: {
                    genre: genre.name,
                    isApproved: 1
                },
                limit: limit,
                offset: offset,
                order: [sortOption]
            }),
            db.Stories.count()
        ]);
        let totalPages = Math.max(Math.ceil(count / limit), 1);

        return res.status(200).json({
            stories: stories,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalStories: count,
                pageSize: limit,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let searchByAuthorName = async (req, res) => {
    try {
        let page = req.params.page || 1;
        let authorName = req.params.authorName;
        let limit = 30;
        if (page < 1) page = 1;
        let offset = (page - 1) * 30;
        let sortOption = req.params.order === "views" ? ["updatedAt", "DESC"] : ["views", "DESC"];

        if (!authorName)
            return res.status(400).json({ message: "Tác giả không tồn tại" });
        let [stories, count] = await Promise.all([
            db.Stories.findAll({
                where: {
                    authorName: authorName,
                    isApproved: 1
                },
                limit: limit,
                offset: offset,
                order: [sortOption]
            }),
            db.Stories.count()
        ]);
        let totalPages = Math.max(Math.ceil(count / limit), 1);

        return res.status(200).json({
            stories: stories,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalStories: count,
                pageSize: limit,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

module.exports = {
    searchByKeyword,
    searchByGenre,
    searchByAuthorName
}