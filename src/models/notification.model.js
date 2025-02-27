'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notifications extends Model {
        static associate(models) {
            Notifications.belongsTo(models.Users, { foreignKey: 'userId', as: 'User' })
        }
    }
    Notifications.init(
        {
            userId: DataTypes.INTEGER,
            storyId: DataTypes.INTEGER,
            chapterId: DataTypes.INTEGER,
            message: DataTypes.STRING,
            isRead: DataTypes.BOOLEAN,
            link: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'Notifications',
            timestamps: true
        }
    );
    return Notifications;
};
