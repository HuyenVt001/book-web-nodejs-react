const db = require("../models/index.js");
const { where, Op } = require("sequelize");

let addGenre = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description)
            return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
        let genre = await db.Genres.findOne({
            where: {
                [Op.or]: [
                    { name: req.body.name },
                    { description: req.body.description }
                ]
            }
        });
        if (genre)
            return res.status(400).json({ message: "Thể loại đã tồn tại" });
        await db.Genres.create({
            name: req.body.name,
            description: req.body.description,
            createdAt: Date.now(),
            updatedAt: DataTransfer.now()
        });
        return res.status(200).json("Thêm thể loại mới thành công");
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let deleteGenre = async (req, res) => {
    try {
        if (!req.body.name)
            return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
        let genre = await db.Genres.findOne({
            where: { name: req.body.name }
        });
        if (!genre)
            return res.status(400).json({ message: "Thể loại không tồn tại" });
        let listStories = await genre.getStories();
        for (let story of listStories) {
            story.removeGenre(genre);
        }
        await db.Genres.destroy({
            where: { name: req.body.name }
        });
        return res.status(200).json("Xóa thể loại mới thành công");
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

let getAll = async (req, res) => {
    try {
        let listGenres = await db.Genres.findAll();
        return res.status(200).send(listGenres);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

module.exports = {
    addGenre,
    deleteGenre,
    getAll
}
