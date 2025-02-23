'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Chapters extends Model {
        static associate(models) { }
    }
    Chapters.init(
        {
            title: DataTypes.STRING,
            content: DataTypes.TEXT,
            storyId: DataTypes.INTEGER,
            views: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Chapters',
            timestamps: true
        }
    );
    return Chapters;
};
