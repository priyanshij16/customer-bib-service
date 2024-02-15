import sequelize from 'sequelize'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'

dotenv.config()

class Database {
  db: string
  user: string
  password: string
  host: string
  instanceName: string
  port: number
  maxPool: number
  minPool: number
  database: sequelize.Sequelize

  constructor() {
    this.db = process.env.LC_DB || 'smartAdmin'
    this.user = process.env.LC_USER || 'Junto_Login'
    this.password = process.env.LC_PASSWORD || 'Junto_001'
    this.host = process.env.LC_HOST || '78.136.9.91'
    this.instanceName = process.env.LC_InstanceName || ''
    this.port = Number(process.env.LC_PORT || 1433)
    this.maxPool = Number(process.env.MAX_POOL) || 50
    this.minPool = Number(process.env.MIN_POOL) || 1

    this.database = new sequelize(this.db, this.user, this.password, {
      host: this.host,
      ssl: false,
      dialect: 'mssql',
      dialectOptions: {
        encrypt: true,
        requestTimeout: 30000,
      },
      logging: false,
      port: this.port,
      pool: {
        max: this.maxPool,
        min: this.minPool,
        acquire: 30000,
        idle: 10000,
      },
    })

    this.database
      .authenticate()
      .then(() => {
        logger.info(
          'Connection has been established successfully to %s. ',
          this.db,
        )
      })
      .catch((err) => {
        logger.error(err, 'Unable to connect to the database: ', this.db)
      })
  }
}
let databaseInstance = new Database().database

export default databaseInstance
