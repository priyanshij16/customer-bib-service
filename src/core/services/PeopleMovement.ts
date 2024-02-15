import { Sequelize, QueryTypes } from 'sequelize'
const { ERROR_TYPE } = require('../../utils/Helpers/constants')
import { Exception } from '../../utils/Helpers/Exception'
import { logger } from '../../utils/logger'
 // used for mainly fotfall 
export class PeopleMovementService {
  dbInstance: Sequelize
  constructor(database: Sequelize) {
    this.dbInstance = database
  }

  async read(query: any) { 
    let options: any = { type: QueryTypes.SELECT, logging: false }

    if (process.env.NODE_ENV === 'development') options.logging = console.log
    
    return this.dbInstance.query(query, options).catch((err) => {
      if (err.name === 'SequelizeDatabaseError' && err.message.includes('Timeout')) {
        throw new Exception(ERROR_TYPE.TIMEOUT_ERROR, 'Timeout Error')
      } else {
        logger.error(err)
        throw new Error(err)
      }
    })
  }
}
