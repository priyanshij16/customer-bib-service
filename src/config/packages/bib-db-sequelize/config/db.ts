import sequelize, { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import { logger } from '../../../../utils/logger'
dotenv.config()
const env = process.env.NODE_ENV || 'development'
require('pg').defaults.parseInt8 = true
interface environmentVariables {
  db: string
  user: string
  password: string
  config: any
}

class Database {
  local: environmentVariables = {
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
        acquire: 30000,
        idle: 10000,
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
        acquire: 30000,
        idle: 10000,
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
        acquire: 30000,
        idle: 10000,
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
        acquire: 30000,
        idle: 10000,
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
        acquire: 30000,
        idle: 10000,
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
        logger.info('Connection has been established successfully.')
      })
      .catch((err) => {
        logger.error('Unable to connect to the database:', err)
      })

    // this.database.sync({
    //     // Using 'force' will drop any table defined in the models and create them again.
    //     // force: true
    // })
  }
}
let databaseInstance = new Database().database
export default databaseInstance
