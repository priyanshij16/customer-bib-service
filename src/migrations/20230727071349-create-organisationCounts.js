'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try{

      await queryInterface.createTable('organisationCounts', {
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
        genericApiType:{
          type: Sequelize.ENUM({values: ['footfall', 'payments', 'transactions']}),
          allowNull: false
        },
        totalCount: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        successCount: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        failCount: {
          type: Sequelize.BIGINT,
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

      logger.error('error in Creating Organisation Counts table (Customer) ::', err)

    }
  },

  async down (queryInterface, Sequelize) {
    try{

      await queryInterface.dropTable('organisationCounts')

    }catch(err){

      logger.error('error in deleting Organisation Counts table (Customer) ::', err)

    }
  }
};
