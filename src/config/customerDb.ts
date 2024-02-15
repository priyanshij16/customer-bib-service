import sequelize, { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
const Umzug = require('umzug')
import path from 'path'
import { logger } from '../app'

dotenv.config()
const env = process.env.NODE_ENV || 'development'
require('pg').defaults.parseInt8 = true

interface environmentVariables {
  db: string
  user: string
  password: string
  config: any
}

class CustomerDatabase {
  local: environmentVariables = {
    db: process.env.DB_NAME || 'db_name',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASS || 'db_pass',
    config: {
      host: process.env.DB_HOST || 'db_host',
      ssl : true,
      dialect: 'postgres',
      dialectOptions: {
        encrypt: true,
      },
      port: Number(process.env.DB_PORT) || 1433,
      logging: false,
      operatorsAliases: false,
      pool: {
        maxPool: Number(process.env.MAX_POOL) || 10,
        minPool: Number(process.env.MIN_POOL) || 1,
        acquire: Number(process.env.ACQUIRE_TIME) || 30000,
        idle: Number(process.env.IDLE_TIME) || 10000,
        evict: Number(process.env.EVICT_TIME) || 1000
      },
      retry: {
        match: [
          // Only retry a query if the error matches one of these strings
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        max: 10, // How many times a failing query is automatically retried. Set to 0 to disable retrying on SQL_BUSY error
      },
    },
  }
  development: environmentVariables = {
    db: process.env.DB_NAME || 'customer_management',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASS || 'db_pass',
    config: {
      host: process.env.DB_HOST || 'db_host',
      dialect: 'postgres',
      dialectOptions: {
        encrypt: true,
      },
      port: Number(process.env.DB_PORT) || 1433,
      logging: false,
      operatorsAliases: false,
      pool: {
        maxPool: Number(process.env.MAX_POOL) || 10,
        minPool: Number(process.env.MIN_POOL) || 1,
        acquire: Number(process.env.ACQUIRE_TIME) || 30000,
        idle: Number(process.env.IDLE_TIME) || 10000
      },
      retry: {
        match: [
          // Only retry a query if the error matches one of these strings
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        max: 10, // How many times a failing query is automatically retried. Set to 0 to disable retrying on SQL_BUSY error
      },
    },
  }
  qa: environmentVariables = {
    db: process.env.DB_NAME || 'customer_management',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASS || 'db_pass',
    config: {
      host: process.env.DB_HOST || 'db_host',
      dialect: 'postgres',
      dialectOptions: {
        encrypt: true,
      },
      port: Number(process.env.DB_PORT) || 1433,
      logging: false,
      operatorsAliases: false,
      pool: {
        maxPool: Number(process.env.MAX_POOL) || 10,
        minPool: Number(process.env.MIN_POOL) || 1,
        acquire: Number(process.env.ACQUIRE_TIME) || 30000,
        idle: Number(process.env.IDLE_TIME) || 10000
      },
      retry: {
        match: [
          // Only retry a query if the error matches one of these strings
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        max: 10, // How many times a failing query is automatically retried. Set to 0 to disable retrying on SQL_BUSY error
      },
    },
  }
  demo: environmentVariables = {
    db: process.env.DB_NAME || 'db_name',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASS || 'db_pass',
    config: {
      host: process.env.DB_HOST || 'db_host',
      dialect: 'postgres',
      dialectOptions: {
        encrypt: true,
      },
      port: Number(process.env.DB_PORT) || 1433,
      logging: false,
      operatorsAliases: false,
      pool: {
        maxPool: Number(process.env.MAX_POOL) || 10,
        minPool: Number(process.env.MIN_POOL) || 1,
        acquire: Number(process.env.ACQUIRE_TIME) || 30000,
        idle: Number(process.env.IDLE_TIME) || 10000
      },
      retry: {
        match: [
          // Only retry a query if the error matches one of these strings
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        max: 10, // How many times a failing query is automatically retried. Set to 0 to disable retrying on SQL_BUSY error
      },
    },
  }
  production: environmentVariables = {
    db: process.env.DB_NAME || 'db_name',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASS || 'db_pass',
    config: {
      host: process.env.DB_HOST || 'db_host',
      dialect: 'postgres',
      dialectOptions: {
        encrypt: true,
      },
      port: Number(process.env.DB_PORT) || 1433,
      logging: false,
      operatorsAliases: false,
      pool: {
        maxPool: Number(process.env.MAX_POOL) || 10,
        minPool: Number(process.env.MIN_POOL) || 1,
        acquire: Number(process.env.ACQUIRE_TIME) || 30000,
        idle: Number(process.env.IDLE_TIME) || 10000
      },
      retry: {
        match: [
          // Only retry a query if the error matches one of these strings
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /TimeoutError/,
        ],
        max: 10, // How many times a failing query is automatically retried. Set to 0 to disable retrying on SQL_BUSY error
      },
    },
  }
  database: sequelize.Sequelize
  constructor() {
    let environment = JSON.parse(JSON.stringify(this))

    this.database = new Sequelize(
      environment[env].db,
      environment[env].user,
      environment[env].password,
      environment[env].config,
    )

    this.database
      .authenticate()
      .then(() => {
        logger.info(
          'Connection has been established successfully ( Customer )',
        )
        migrate
          .up()
          .then((onFullfill: any) => {
            logger.debug(
              'All migrations performed successfully ( Customer )',
            )
            seed
              .up()
              .then((onSeed: any) => {
                logger.debug('Data seed successfull. ( Customer )')
              })
              .catch((err: any) => {
                logger.error('Seeder failed ( Customer ): ', err)
              })
          })
          .catch((err: any) => {
            logger.error('Migration failed ( Customer ): ', err)
          })
      })
      .catch((err) => {
        logger.error('Unable to connect to the database ( Customer ):', err)
      })
  }
}
let customerDatabaseInstance = new CustomerDatabase().database

const migrate = new Umzug({
  migrations: {
    // indicates the folder containing the migration .js files
    path: path.join(__dirname, '../migrations'),
    pattern: /\.js$/,
    // inject sequelize's QueryInterface in the migrations
    params: [customerDatabaseInstance.getQueryInterface(), sequelize],
  },
  // indicates that the migration data should be store in the database
  // itself through sequelize. The default configuration creates a table
  // named `SequelizeMeta`.
  storage: 'sequelize',
  storageOptions: {
    sequelize: customerDatabaseInstance,
  },
})

const seed = new Umzug({
  migrations: {
    // indicates the folder containing the migration .js files
    path: path.join(__dirname, '../seeders'),
    pattern: /\.js$/,
    // inject sequelize's QueryInterface in the migrations
    params: [customerDatabaseInstance.getQueryInterface(), sequelize],
  },
  // indicates that the migration data should be store in the database
  // itself through sequelize. The default configuration creates a table
  // named `SequelizeMeta`.
  storage: 'sequelize',
  storageOptions: {
    sequelize: customerDatabaseInstance,
  },
})

export default customerDatabaseInstance
