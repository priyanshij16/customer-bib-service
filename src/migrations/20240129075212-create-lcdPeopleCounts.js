'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try{

      await queryInterface.createTable('lcdPeopleCounts', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        deviceIdentifier: {
          type: Sequelize.UUID,
          allowNull: false
        },
        uniqueKey: {
          type: Sequelize.TEXT,
          unique: true,
          allowNull: false,
        },
        eventTimestamp:{
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true
        }
      })

    }catch(err){
      logger.error('error in Creating lcdPeopleCounts table (Customer) ::', err)
    }
  },

  async down (queryInterface, Sequelize) {
    try{
      await queryInterface.dropTable('lcdPeopleCounts')
    }catch(err){
      logger.error('error in deleting lcdPeopleCounts table (Customer) ::', err)
    }
  }
};
