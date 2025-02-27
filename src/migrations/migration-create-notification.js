'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            storyId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Stories',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            chapterId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Chapters',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            message: {
                type: Sequelize.STRING
            },
            isRead: {
                type: Sequelize.BOOLEAN
            },
            link: {
                type: Sequelize.STRING,
                validate: {
                    isUrl: true
                }
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
        await queryInterface.dropTable('Notifications');
    }
};