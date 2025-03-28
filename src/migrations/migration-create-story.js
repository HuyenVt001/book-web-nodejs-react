'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Stories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING
            },
            authorName: {
                allowNull: false,
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            status: {
                allowNull: false,
                type: Sequelize.STRING
            },
            /* 
                0: completed
                1: on-going
                2: drop
            */
            genre: {
                allowNull: false,
                type: Sequelize.STRING
            },
            lastestChapterId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            image: {
                type: Sequelize.STRING,
                validate: {
                    isUrl: true
                }
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
        await queryInterface.dropTable('Stories');
    }
};