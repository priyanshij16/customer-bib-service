
import sequelize from 'sequelize'
import database from '../config/customerDb'

// Database connection instance
let customerDatabaseInstance = database

export enum path {
  lcd_to_rmq = 'lcd_to_rmq',
  rmq_to_link = 'rmq_to_link',
}

// User Interface
export interface MigrationMetricAttributes {
  id?: number
  organisationId: string
  eventType: string
  startDate: Date
  endDate: Date
  path: path
  iterationCount: number
  retryCount: number
  twentyFourHourTimeout: number
  twelveHourTimeout: number
  sixHourTimeout: number
  errorCount: number
  dbErrorCount: number
  receivedCount: number
  publishedCount: number
  processedCount: number
  badDataCount: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface MigrationMetricInterface
  extends sequelize.Instance<MigrationMetricAttributes>,
  MigrationMetricAttributes { }

// Sequelize Model
export const MigrationMetric: sequelize.Model<
  MigrationMetricInterface,
  MigrationMetricAttributes
  > = customerDatabaseInstance.define<MigrationMetricInterface, MigrationMetricAttributes>('migrationMetrics',{

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

    path: {
      type: sequelize.ENUM({values: [path.lcd_to_rmq, path.rmq_to_link]}),
      allowNull: false,
    },

    iterationCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    retryCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    twentyFourHourTimeout: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    twelveHourTimeout: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    sixHourTimeout: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    errorCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    dbErrorCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    receivedCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    publishedCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    processedCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    },

    badDataCount: {
      type: sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
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