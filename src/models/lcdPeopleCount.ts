
import sequelize from 'sequelize'
import database from '../config/customerDb'

// Database connection instance
let customerDatabaseInstance = database

// User Interface
export interface LcdPeopleCountsAttributes {
  id?: number
  deviceIdentifier: string
  uniqueKey: string
  eventTimestamp: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface LcdPeopleCountsInterface
  extends sequelize.Instance<LcdPeopleCountsAttributes>,
  LcdPeopleCountsAttributes { }

// Sequelize Model
export const LcdPeopleCount: sequelize.Model<
LcdPeopleCountsInterface,
LcdPeopleCountsAttributes
> = customerDatabaseInstance.define<LcdPeopleCountsInterface, LcdPeopleCountsAttributes>('lcdPeopleCounts',{

    id: {
      type: sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    deviceIdentifier: {
      type: sequelize.UUID,
      allowNull: false,
    },

    uniqueKey: {
      type: sequelize.TEXT,
      unique: true,
      allowNull: false,
    }, 

    eventTimestamp: {
      type: sequelize.DATE,
      allowNull: true
    },

    createdAt: {
      type: sequelize.DATE,
      defaultValue: sequelize.NOW,
      allowNull: false
    },

    updatedAt: {
      type: sequelize.DATE,
      defaultValue: sequelize.NOW,
      allowNull: false
    },

    deletedAt: {
      type: sequelize.DATE,
      allowNull: true
    },
  },
  {
    // Auto-create timestamps
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    // Enable soft deletes
    paranoid: true
  },
)