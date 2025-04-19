'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comments extends Model {
        static associate(models) {
            Comments.belongsTo(models.Users, { foreignKey: 'userId', as: 'Users' });
            Comments.belongsTo(models.Stories, { foreignKey: 'storyId', as: 'Stories' })
        }
    }
    Comments.init(
        {
            userId: DataTypes.INTEGER,
            storyId: DataTypes.INTEGER,
            content: DataTypes.TEXT,
            isApproved: DataTypes.BOOLEAN
        },
        {
            sequelize,
            modelName: 'Comments',
            timestamps: true
        }
    );
    return Comments;
};
