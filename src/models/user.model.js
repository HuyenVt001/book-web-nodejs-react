'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        static associate(models) {
            Users.belongsToMany(models.Stories, { through: 'FavoriteStories', as: 'Favorites', foreignKey: 'userId', otherKey: 'storyId' });
            Users.belongsToMany(models.Stories, { through: 'ManagedStories', as: 'Managed', foreignKey: 'userId', otherKey: 'storyId' });
            Users.hasMany(models.Notifications, { foreignKey: 'userId', as: 'Notifications' });
            Users.hasMany(models.Comments, { foreignKey: 'userId', as: 'Comments' })
        }
    }
    Users.init(
        {
            username: DataTypes.STRING,
            password: DataTypes.STRING,
            email: DataTypes.STRING,
            roleId: DataTypes.INTEGER,
            avatar: DataTypes.STRING,
            isVerified: DataTypes.BOOLEAN
        },
        {
            sequelize,
            modelName: 'Users',
            timestamps: true
        }
    );
    return Users;
};
