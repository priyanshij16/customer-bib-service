import { logger } from '../app';
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try{

      await queryInterface.createTable('migrationLogs', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        organisationId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        eventType: {
          type: Sequelize.STRING,
          allowNull: false
        },
        startDate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        endDate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        isSuccess: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        retryList: {
          type: Sequelize.JSONB,
          allowNull: true
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

      logger.error('error in Creating Migration Logs table (Customer) ::', err)

    }
  },

  async down (queryInterface, Sequelize) {
    try{

      await queryInterface.dropTable('migrationLogs')

    }catch(err){

      logger.error('error in deleting Migration Logs table (Customer) ::', err)

    }
  }
};
