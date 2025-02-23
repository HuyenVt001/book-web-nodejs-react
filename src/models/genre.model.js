'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Genres extends Model {
        static associate(models) { }
    }
    Genres.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'Genres',
            timestamps: true
        }
    );
    return Genres;
};
