import { Request, Response } from 'express'
import axios from 'axios'
import migrationDatabaseInstance from '../config/migrationDb'
import { PeopleMovementService } from '../core/services/PeopleMovement'
import { genericApiCounterInstance } from '../utils/countMetrics'
import { Exception } from '../utils/Helpers/Exception'
import { sendError, sendSuccess } from '../utils/Helpers/resHandler'
import { AuthController } from './AuthController'
import { BaseController } from './BaseController'
import constant from '../config/packages/bib-response-handler/constants.js'
import { logger } from '../app'
import { migrationScriptInstance } from '../utils/MigrationScript'
import { MigrationMetric } from '../models/migrationMetric'
import moment from 'moment'
import { MigrationLog } from '../models/migrationLog'

export class MigrationController extends BaseController {
  dataService: PeopleMovementService
  constructor() {
    super()
    this.dataService = new PeopleMovementService(migrationDatabaseInstance)
    this.readDataForcustomerMigration = this.readDataForcustomerMigration.bind(this)
  }

  async readDataForcustomerMigration(req: Request, res: Response) {
    try{
      let { startDate, endDate , eventType, clientId}: any = req.query    

      let organisationId: any = clientId?.toLowerCase()
      let linkHierarchy: any
      if(migrationScriptInstance.isRunning) {
        logger.error(`A migration is already running for organisationId: ${migrationScriptInstance.organisationId} and event type: ${migrationScriptInstance.eventType}`)
        throw new Exception(constant.ERROR_TYPE.ALREADY_EXISTS,'A migration is already in progress.')
      }

      let queryForOrganisationName = `SELECT
            DISTINCT(SAClient.name) from SAClient
            INNER JOIN SALocation
            on SAClient.Id=SALocation.ClientId
            WHERE
            SALocation.ClientId='${clientId}'`

      let resultForOrganisationName = await this.dataService.read(queryForOrganisationName)

      if(!resultForOrganisationName[0]){
       throw new Exception(constant.ERROR_TYPE.NOT_FOUND,'OrganisationId does not exist in LCD')
      }

      try{
        let linkOrgExists = await axios({
          url: `${process.env.LINK_URL}/api/v1/checkLcHierarchy/${organisationId}`,
          method: 'GET',
          headers: {
            'service-token': process.env.SERVICE_TOKEN,
          }
        })

        if(!linkOrgExists?.data?.result?.parentHierarchy){
          throw new Exception(constant.ERROR_TYPE.NOT_FOUND,'OrganisationId does not exist in LINK')
        }

        linkHierarchy = linkOrgExists?.data?.result
      } catch(err: any){
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND,'OrganisationId cannot be verified due to error in LINK')
      }

      logger.info("Data Migration for Customer::::::",organisationId)

      try{
        eventType = eventType?.toLowerCase()
        if(!eventType.includes("transactions") && !eventType.includes("payments") && !eventType.includes("footfall")){
          throw new Exception(constant.ERROR_TYPE.BAD_REQUEST,'Please enter valid eventType')
        }

        if (startDate && endDate) {
          let correctStartDate = startDate?.match(/^[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
          let correctEndDate = endDate?.match(/^[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)

          if(!(correctStartDate && correctEndDate))
            throw new Exception(constant.ERROR_TYPE.BAD_REQUEST,'Please enter correct date and date format should be yyyy-mm-dd')

          startDate = startDate.toString()
          endDate = endDate.toString()          
          await this.checkForMaxRange(startDate,endDate)
        } else {
          throw new Exception(constant.ERROR_TYPE.NOT_FOUND,'Start Date/End Date is missing')
        }

        migrationScriptInstance.runMigration(organisationId,startDate,endDate,eventType,linkHierarchy)

        sendSuccess(res, { message: 'Script is running in the background.' })
      } catch (err: any) {
        logger.error("Error Encountered in readDataForCustomerPayment function",err)
        throw err
      }
    } catch(error: any){
      logger.error("Error Encountered in customer migration",error)
      sendError(res, error)
    }
  }

  async checkForMaxRange(startDate: string, endDate: string) {
    try{
      let from = new Date(startDate).getTime()
      let to = new Date(endDate).getTime()
      let numberOfDays = (to - from) / (24 * 60 * 60 * 1000)
      if (numberOfDays < 0)
        throw new Exception(
          constant.ERROR_TYPE.BAD_REQUEST,
          'startDate should be less than endDate',
        )

      return true
    } catch(err: any){
      throw err
    }
  }
}
