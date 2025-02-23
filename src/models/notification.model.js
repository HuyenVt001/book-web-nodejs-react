'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notifications extends Model {
        static associate(models) { }
    }
    Notifications.init(
        {
            userId: DataTypes.INTEGER,
            storyId: DataTypes.INTEGER,
            chapterId: DataTypes.INTEGER,
            message: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'Notifications',
            timestamps: true
        }
    );
    return Notifications;
};
