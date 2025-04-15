'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Thêm cột isApproved vào bảng Stories
        await queryInterface.addColumn('Stories', 'isApproved', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Trạng thái kiểm duyệt của truyện'
        });

        // Thêm cột isApproved vào bảng Chapters
        await queryInterface.addColumn('Chapters', 'isApproved', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Trạng thái kiểm duyệt của chương'
        });

        // Cập nhật các bản ghi hiện có
        await queryInterface.sequelize.query(`
      UPDATE Stories SET isApproved = true WHERE status = 'Hoàn thành';
      UPDATE Chapters SET isApproved = true;
    `);
    },

    down: async (queryInterface, Sequelize) => {
        // Xóa cột isApproved khỏi bảng Stories
        await queryInterface.removeColumn('Stories', 'isApproved');

        // Xóa cột isApproved khỏi bảng Chapters
        await queryInterface.removeColumn('Chapters', 'isApproved');
    }
}; 