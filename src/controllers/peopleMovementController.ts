import { Request, Response } from 'express'
import client from 'prom-client'
import databaseInstance from '../config/db'
import { PeopleMovementService } from '../core/services/PeopleMovement'
import { genericApiCounterInstance } from '../utils/countMetrics'
import { Exception } from '../utils/Helpers/Exception'
import { sendError, sendSuccess } from '../utils/Helpers/resHandler'
import { AuthController } from './AuthController'
import { BaseController } from './BaseController'
const { ERROR_TYPE } = require('../utils/Helpers/constants')
import constant from '../config/packages/bib-response-handler/constants.js'
import { logger } from '../app'
import  customerDatabaseInstance  from '../config/customerDb'
import { OrganisationCount,genericApiType } from '../models/organisationCount'
import { maxFootfallDataLimit } from '../core/constants/constant'

export class PeopleMovement extends BaseController {
  dataService: PeopleMovementService
  constructor() {
    super()
    this.dataService = new PeopleMovementService(databaseInstance)
    this.readDataForOrganisation = this.readDataForOrganisation.bind(this)
  }

  async readDataForOrganisation(req: Request, res: Response) {
    const organisationId = AuthController.decodeBase64(
      req.body.key || req.params.id,
    )
    try {
      let { startDate, endDate }: any = req.query
      let query:any;
      let queryForOrganisationName = `SELECT
            DISTINCT(SAClient.name) from SAClient
            INNER JOIN SALocation
            on SAClient.Id=SALocation.ClientId
            WHERE
            SALocation.ClientId='${organisationId}'`

      let resultForOrganisationName = await this.dataService.read(queryForOrganisationName)
      if(!resultForOrganisationName[0]){
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND,'OrganisationId does not exist')
      }

      logger.info("Generic Api(Footfall)) for Customer::::::",organisationId)

      try {
        let frequency = 'HOUR';

        if (startDate && endDate) {
          let correctStartDate = startDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)
          let correctEndDate = endDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)

          if(!(correctStartDate && correctEndDate))
            throw new Exception(ERROR_TYPE.BAD_REQUEST,'Please enter correct date and date format should be yyyy-mm-dd hh:mm:ss') 

          startDate = startDate.toString()
          endDate = endDate.toString()
          query = `EXEC API_GetCombinedFootfallData
          @OrganisationID = '${organisationId}',
          @startDate = '${startDate}',
          @EndDate = '${endDate}'`
         
          await this.checkForMaxRange(startDate,endDate)
        } else {
          query = `EXEC API_GetCombinedFootfallData
          @OrganisationID = '${organisationId}'`
        }

        let result = await this.dataService.read(query)
        if(result.length > maxFootfallDataLimit){
          throw new Exception(ERROR_TYPE.TOOLARGE_ERROR,'Too much data')
        }

        result = { frequency, result }
        await this.organisationFootfallCount(organisationId,'success')
        logger.info("Generic Api(Payments) for Customer Finished::::::",organisationId)      
        sendSuccess(res, result)
      } catch (err) {
        await this.organisationFootfallCount(organisationId,'fail')
        logger.error("Error Encountered in readDataForCustomerPayment function",err)
        sendError(res, err)
      }
    }
    catch (err) {
      sendError(res,err)
    }
  }

  async checkForMaxRange(startDate: string, endDate: string) {
    let from = new Date(startDate).getTime()
    let to = new Date(endDate).getTime()
    let numberOfDays = (to - from) / (24 * 60 * 60 * 1000)
    if (numberOfDays < 0)
      throw new Exception(
        ERROR_TYPE.BAD_REQUEST,
        'startDate should be less than endDate',
      )
    if (numberOfDays > 31)
      throw new Exception(
        ERROR_TYPE.BAD_REQUEST,
        'Date range should be maximum 31 days',
      )

    return { from, to }
  }

  getFrequency(startDate: number, endDate: number) {
    let numberOfDays = (endDate - startDate) / (24 * 60 * 60 * 1000)
    if (numberOfDays <= 1) return 'HOUR'
    if (numberOfDays <= 7) return 'DAY'
    if (numberOfDays <= 31) return 'WEEK'
    return 'HOUR'
  }

  async organisationFootfallCount(organisationId:any,status:any){
    let _transaction = await customerDatabaseInstance.transaction()
    try{
      let apiCounter:any
      switch(status){
        case 'success':
          apiCounter = genericApiCounterInstance.genericApiMap.get(`footfall_${organisationId}`)
          if(apiCounter){
            let totalCount = ++apiCounter.totalCount
            let successCount = ++apiCounter.successCount
            let failCount = apiCounter.failCount

            //Update Count in Hash Map
            genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType: genericApiType.footfall})
            //Update Count in Database
            await OrganisationCount.update({totalCount,successCount,failCount},{where: {organisationId,genericApiType:genericApiType.footfall}, transaction: _transaction})
          }else{
            let orgCount = await OrganisationCount.findOne({where: {
                organisationId,genericApiType:genericApiType.footfall
              },
              transaction: _transaction,
              attributes: ['totalCount','successCount','failCount'],
              raw: true
            })
            if(orgCount){
              let totalCount = ++orgCount.totalCount
              let successCount = ++orgCount.successCount
              let failCount = orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType:genericApiType.footfall})
              //Update Count in Database
              await OrganisationCount.update({totalCount,successCount,failCount},{where: {organisationId,genericApiType:genericApiType.footfall}, transaction: _transaction})
            }else{
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{totalCount: 1, successCount: 1, failCount: 0, genericApiType:genericApiType.footfall})
              //Create Count in Database
              await OrganisationCount.create({organisationId,genericApiType:genericApiType.footfall,totalCount:1,successCount:1,failCount:0},{transaction:_transaction})
            }
          }
          break
        case 'fail':
          apiCounter = genericApiCounterInstance.genericApiMap.get(`footfall_${organisationId}`)
          if(apiCounter){
            let totalCount = ++apiCounter.totalCount
            let successCount = apiCounter.successCount
            let failCount = ++apiCounter.failCount

            //Update Count in Hash Map
            genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType:genericApiType.footfall})
            //Update Count in Database
            await OrganisationCount.update({totalCount,successCount,failCount},{where: {organisationId,genericApiType:genericApiType.footfall}, transaction: _transaction})
          }else{
            let orgCount = await OrganisationCount.findOne({where: {
                organisationId,genericApiType:genericApiType.footfall
              },
              transaction: _transaction,
              attributes: ['totalCount','successCount','failCount'],
              raw: true
            })
            if(orgCount){
              let totalCount = ++orgCount.totalCount
              let successCount = orgCount.successCount
              let failCount = ++orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType:genericApiType.footfall})
              //Update Count in Database
              await OrganisationCount.update({totalCount,successCount,failCount},{where: {organisationId,genericApiType:genericApiType.footfall}, transaction: _transaction})
            }else{
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`footfall_${organisationId}`,{total: 1, success: 0, fail: 1, genericApiType:genericApiType.footfall})
              //Create Count in Database
              await OrganisationCount.create({organisationId,genericApiType:genericApiType.footfall,totalCount:1,successCount:0,failCount:1},{transaction:_transaction})
            }
          }
          break
        default: break
      }
      await _transaction.commit()
     return 'success'
    }catch(error){
      await _transaction.rollback()
      logger.error("Error Encountered while creating/updating count metrices",error)
    }
  }
}
