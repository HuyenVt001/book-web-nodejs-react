'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comments extends Model {
        static associate(models) { }
    }
    Comments.init(
        {
            userId: DataTypes.INTEGER,
            storyId: DataTypes.INTEGER,
            content: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'Comments',
            timestamps: true
        }
    );
    return Comments;
};
