import { logger } from '../app';
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try{

      await queryInterface.createTable('migrationMetrics', {
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
        path: {
          type: Sequelize.ENUM('lcd_to_rmq','rmq_to_link'),
          allowNull: false
        },
        iterationCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        retryCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        twentyFourHourTimeout: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        twelveHourTimeout: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        sixHourTimeout: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        errorCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        dbErrorCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        receivedCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        publishedCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        processedCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
        },
        badDataCount: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 0
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

      logger.error('error in Creating Migration Metrics table (Customer) ::', err)

    }
  },

  async down (queryInterface, Sequelize) {
    try{

      await queryInterface.dropTable('migrationMetrics')

    }catch(err){

      logger.error('error in deleting Migration Metrics table (Customer) ::', err)

    }
  }
};
