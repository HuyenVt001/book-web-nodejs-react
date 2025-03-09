const db = require("../models/index.js");
const { Op } = require("sequelize");

let searchByKeyword = async (req, res) => {
    try {
        let keyword = req.body.keyword;
        if (!keyword)
            return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
        let stories = await db.Stories.findAll(
            {
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${keyword}%` } },
                        { authorName: { [Op.like]: `%${keyword}%` } }
                    ]
                }
            }
        );
        return res.status(200).json({ stories: stories });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let searchByGenre = async (req, res) => {
    try {
        let genre = await db.Genres.findByPk(req.params.genre);
        if (!genre)
            return res.status(400).json({ message: "Thể loại không tồn tại" });
        let stories = await genre.getStories();
        return res.status(200).json({ stories: stories });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

module.exports = {
    searchByKeyword,
    searchByGenre
}