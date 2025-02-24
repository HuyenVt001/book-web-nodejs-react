'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Stories extends Model {
        static associate(models) { }
    }
    Stories.init(
        {
            title: DataTypes.STRING,
            authorName: DataTypes.STRING,
            description: DataTypes.TEXT,
            statusId: DataTypes.INTEGER,
            lastestChapterId: DataTypes.INTEGER,
            image: DataTypes.STRING,
            views: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Stories',
            timestamps: true
        }
    );
    Stories.associate = (models) => {
        Stories.belongsToMany(models.Users, { through: 'FavoriteStories', as: 'Favorites' }),
        Stories.belongsToMany(models.Users, { through: 'ManagedStories', as: 'Managed' })
        Stories.belongsToMany(models.Genres, { through: 'Story_Genre' })
    }
    return Stories;
};
