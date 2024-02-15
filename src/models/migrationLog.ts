
import sequelize from 'sequelize'
import database from '../config/customerDb'

// Database connection instance
let customerDatabaseInstance = database

export enum path {
  lcd_to_rmq = 'lcd_to_rmq',
  rmq_to_link = 'rmq_to_link',
}

// User Interface
export interface MigrationLogAttributes {
  id?: number
  organisationId: string
  eventType: string
  startDate: Date
  endDate: Date
  isSuccess: boolean
  retryList: any[]
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface MigrationLogInterface
  extends sequelize.Instance<MigrationLogAttributes>,
  MigrationLogAttributes { }

// Sequelize Model
export const MigrationLog: sequelize.Model<
MigrationLogInterface,
  MigrationLogAttributes
  > = customerDatabaseInstance.define<MigrationLogInterface, MigrationLogAttributes>('migrationLogs',{

    id: {
      type: sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    organisationId: {
      type: sequelize.UUID,
      allowNull: false,
    },

    eventType: {
      type: sequelize.STRING,
      allowNull: false,
    },

    startDate: {
      type: sequelize.DATE,
      allowNull: false
    },

    endDate: {
      type: sequelize.DATE,
      allowNull: false
    },

    isSuccess: {
      type: sequelize.BOOLEAN,
      defaultValue: false
    },

    retryList: {
      type: sequelize.JSONB,
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