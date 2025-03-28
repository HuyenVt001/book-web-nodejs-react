'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Genres extends Model {
        static associate(models) {
            Genres.hasMany(models.Stories, { foreignKey: 'name', as: 'Stories' });
        }
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
    Genres.associate = (models) => {
        Genres.belongsToMany(models.Stories, { through: "Story_Genre", foreignKey: 'genreId', otherKey: 'storyId' })
    }
    return Genres;
};
