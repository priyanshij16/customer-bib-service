
import sequelize from 'sequelize'
import database from '../config/customerDb'

// Database connection instance
let customerDatabaseInstance = database

export enum genericApiType {
  footfall = 'footfall',
  payments = 'payments',
  transactions = 'transactions'
}

// User Interface
export interface OrganisationCountAttributes {
  id?: number
  organisationId: string
  genericApiType: genericApiType
  totalCount: number
  successCount: number
  failCount: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface OrganisationCountInterface
  extends sequelize.Instance<OrganisationCountAttributes>,
  OrganisationCountAttributes { }

// Sequelize Model
export const OrganisationCount: sequelize.Model<
OrganisationCountInterface,
OrganisationCountAttributes
> = customerDatabaseInstance.define<OrganisationCountInterface, OrganisationCountAttributes>('organisationCount',{

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

    genericApiType: {
      type: sequelize.ENUM({values: [genericApiType.footfall,genericApiType.payments,genericApiType.transactions]}),
      allowNull: false,
      defaultValue: genericApiType.footfall,
    },

    totalCount: {
      type: sequelize.INTEGER,
      allowNull: true
    },

    successCount: {
      type: sequelize.INTEGER,
      allowNull: true
    },

    failCount: {
      type: sequelize.INTEGER,
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