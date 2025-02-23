'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Chapters', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            // title: DataTypes.STRING,
            // content: DataTypes.TEXT,
            // storyId: DataTypes.INTEGER,
            // views: DataTypes.INTEGER
            title: {
                type: Sequelize.STRING
            },
            content: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            storyId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            views: {
                defaultValue: 0,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Chapters');
    }
};