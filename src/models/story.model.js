'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Stories extends Model {
        static associate(models) {
            Stories.belongsToMany(models.Users, { through: 'FavoriteStories', as: 'Favorites', foreignKey: 'storyId', otherKey: 'userId' });
            Stories.belongsToMany(models.Users, { through: 'ManagedStories', as: 'Managed', foreignKey: 'storyId', otherKey: 'userId' });
            Stories.belongsToMany(models.Genres, { through: 'Story_Genre', foreignKey: 'storyId', otherKey: 'genreId' });
            Stories.hasMany(models.Chapters, { foreignKey: 'storyId', as: 'Chapters' });
            Stories.belongsTo(models.Genres, { foreignKey: 'genre', as: 'Genre' })
        }
    }
    Stories.init(
        {
            title: DataTypes.STRING,
            authorName: DataTypes.STRING,
            description: DataTypes.TEXT,
            status: DataTypes.STRING,
            /**
             * Completed
             * On-going
             */
            genre: DataTypes.STRING,
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
    return Stories;
};
