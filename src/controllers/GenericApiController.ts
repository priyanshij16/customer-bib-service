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
import { OrganisationCount, genericApiType } from '../models/organisationCount'
import customerDatabaseInstance from '../config/customerDb'
import { maxTrasactionDataLimit, maxGenericApiHits } from '../core/constants/constant'

export class GenericApi extends BaseController {
  dataService: PeopleMovementService
  constructor() {
    super()
    this.dataService = new PeopleMovementService(databaseInstance)
    this.readDataForCustomerPayment = this.readDataForCustomerPayment.bind(this)
    this.readDataForCustomerTransaction = this.readDataForCustomerTransaction.bind(this)
    this.readDataForCustomerCount = this.readDataForCustomerCount.bind(this)
  }
  // there are 5 functions

  async readDataForCustomerPayment(req: Request, res: Response) {

    try { // taking id from client side 
      const organisationId = AuthController.decodeBase64(req.body.key || req.params.id,)
      // this query for it 
      let queryForOrganisationName = `SELECT
            DISTINCT(SAClient.name) from SAClient
            INNER JOIN SALocation
            on SAClient.Id=SALocation.ClientId
            WHERE
            SALocation.ClientId='${organisationId}'`

      let orgCheckTimer = new Date().getTime()
      // this read function retrieve information from database 
      let resultForOrganisationName = await this.dataService.read(queryForOrganisationName)
      logger.info(`Organisation Check Timer: ${(new Date().getTime() - orgCheckTimer) / 1000} sec`)

      if (!resultForOrganisationName[0]) {
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND, 'OrganisationId does not exist')
      }

      logger.info("Generic Api(Payments) for Customer::::::", organisationId)

      try { // extract the startDate and endDate properties from the req.query object.
        let { startDate, endDate }: any = req.query
        let presentDate = new Date().toISOString().split('T')[0] // used to as dob include time also so we use s('t)to remove it 

        //  .split() turns the values into an array starting at 0.

        // so if we did date = date.split('T') then data[0] is = "2017-05-21" and data[1] is = "00:00:00"
        let query: any;


        if (startDate && endDate) { // >>>>>>>>>>>>>>>>>>.
          let correctStartDate = startDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)
          let correctEndDate = endDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)

          // if date is not correct just throw exception 
          if (!(correctStartDate && correctEndDate))
            throw new Exception(ERROR_TYPE.BAD_REQUEST,
              'Please enter correct date and date format should be yyyy-mm-dd hh:mm:ss')

          // convert date to string 
          startDate = startDate.toString()
          endDate = endDate.toString()

          // checking date should be within range 
          this.checkForMaxRange(startDate, endDate,)

          // stored procedure is a prepared SQL code that you can save, so the code can be reused over and over again.

          query = `EXEC API_GetCombinedPaymentData 
          @OrganisationID = '${organisationId}', 
          @startDate = '${startDate}',
          @EndDate = '${endDate}'`
        }
        else {
          query = `EXEC API_GetCombinedPaymentData 
            @OrganisationID = '${organisationId}'`
        }
        //: This line retrieves the call count info from map (paymentCountDailyMap) stored in genericApiCounterInstance. 
        // key for this map seems to be a combination of organisationId and presentDate

        let callCount = genericApiCounterInstance.paymentCountDailyMap.get
          (`${organisationId}_${presentDate}`) // this is the key combinantion of orgid &presentid

        // -----------------------------------------------------
        if (callCount) {
          // this will check no of tries for orgn else decrement by 1 
          if (callCount.triesLeft == 0)

            throw new Exception(ERROR_TYPE.NOT_ALLOWED, `Max retries exceeded of Customer Payment for Today`)
          else
            genericApiCounterInstance.paymentCountDailyMap.set(`${organisationId}_${presentDate}`, { triesLeft: --callCount.triesLeft })
        }
        // else  it sent call count for org & date in map with max no of allowed API hits -1
        else {
          genericApiCounterInstance.paymentCountDailyMap.set(`${organisationId}_${presentDate}`, { triesLeft: maxGenericApiHits - 1 })
        }

        let transactionTimer = new Date().getTime()
        let result = await this.dataService.read(query)

        if (result.length > maxTrasactionDataLimit) {
          throw new Exception(ERROR_TYPE.TOOLARGE_ERROR, 'Too much data')
        }
        logger.info(`Transactions Timer: ${(new Date().getTime() - transactionTimer) / 1000} sec`)

        await this.organisationPaymentCount(organisationId, 'success')

        logger.info("Generic Api(Payments) for Customer Finished::::::", organisationId)
        sendSuccess(res, result)
      } catch (err: any) {
        if (err.errorType != ERROR_TYPE.NOT_ALLOWED) {
          let presentDate = new Date().toISOString().split('T')[0]
          let callCount = genericApiCounterInstance.paymentCountDailyMap.get(`${organisationId}_${presentDate}`)
          if (callCount && callCount?.triesLeft < maxGenericApiHits) {
            genericApiCounterInstance.paymentCountDailyMap.set(`${organisationId}_${presentDate}`, { triesLeft: ++callCount.triesLeft })
          }
        }

        await this.organisationPaymentCount(organisationId, 'fail')

        logger.error("Error Encountered in readDataForCustomerPayment function", err)
        sendError(res, err)
      }
    } catch (error) {
      sendError(res, error)
    }
  }

  async readDataForCustomerTransaction(req: Request, res: Response) {

    try {
      const organisationId = AuthController.decodeBase64(
        req.body.key || req.params.id,
      )

      let queryForOrganisationName = `SELECT
            DISTINCT(SAClient.name) from SAClient
            INNER JOIN SALocation
            on SAClient.Id=SALocation.ClientId
            WHERE
            SALocation.ClientId='${organisationId}'`

      let orgCheckTimer = new Date().getTime()
      let resultForOrganisationName = await this.dataService.read(queryForOrganisationName)
      logger.info(`Organisation Check Timer: ${(new Date().getTime() - orgCheckTimer) / 1000} sec`)
      if (!resultForOrganisationName[0]) {
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND, 'OrganisationId does not exist')
      }

      logger.info("Generic Api(transactions) for Customer::::::", organisationId)

      try {
        let { startDate, endDate }: any = req.query

        let presentDate = new Date().toISOString().split('T')[0]
        let query: any

        if (startDate && endDate) {
          let correctStartDate = startDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)
          let correctEndDate = endDate?.match(/[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-4])(:[0-5]\d){2}/)

          if (!(correctStartDate && correctEndDate))
            throw new Exception(ERROR_TYPE.BAD_REQUEST, 'Please enter correct date and date format should be yyyy-mm-dd hh:mm:ss')

          startDate = startDate.toString()
          endDate = endDate.toString()
          this.checkForMaxRange(
            startDate,
            endDate,
          )

          query = `EXEC API_GetCombinedTransactionData 
          @OrganisationID = '${organisationId}', 
          @startDate = '${startDate}',
          @EndDate = '${endDate}'`

        } else {
          query = `EXEC API_GetCombinedTransactionData 
          @OrganisationID = '${organisationId}'`
        }
        // >>>>>>>>>>>
        // transcount is for transaction counts 

        // it will suggest that a particular api can hit only 3 times per day 
        // a particular orgn can hit api only 3 times 
        let callCount = genericApiCounterInstance.transCountDailyMap.get(`${organisationId}_${presentDate}`)
        if (callCount) {
          if (callCount.triesLeft == 0)

            throw new Exception(ERROR_TYPE.NOT_ALLOWED, `Max retries exceeded of Customer Transaction for Today`)
          else  // it will decrement  (tryleft :(decrease )--callcount )
            genericApiCounterInstance.transCountDailyMap.set(`${organisationId}_${presentDate}`,
              { triesLeft: --callCount.triesLeft })
        }
        // It sets the call count for the org and date in the map with the maximum number of allowed
        // API hits minus one, implying that one API call has been used.

        else {
          genericApiCounterInstance.transCountDailyMap.set(`${organisationId}_${presentDate}`,
            { triesLeft: maxGenericApiHits - 1 })
        }

        let transactionItemTimer = new Date().getTime()
        let result = await this.dataService.read(query)
        // 
        if (result.length > maxTrasactionDataLimit) {
          throw new Exception(ERROR_TYPE.TOOLARGE_ERROR, 'Too much data')
        }
        logger.info(`TransactionItems Timer: ${(new Date().getTime() - transactionItemTimer) / 1000} sec`)

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        let apiCounter = genericApiCounterInstance.genericApiMap.get(`customerTransactionCount_${organisationId}`)
        if (apiCounter)

          genericApiCounterInstance.genericApiMap.set(`customerTransactionCount_${organisationId}`,
            { total: ++apiCounter.total, success: ++apiCounter.success, fail: apiCounter.fail })
        else
          genericApiCounterInstance.genericApiMap.set(`customerTransactionCount_${organisationId}`,
            { total: 1, success: 1, fail: 0 })

        await this.organisationTransCount(organisationId, 'success')
        logger.info("Generic Api(transactions) for Customer Finished::::::", organisationId)
        sendSuccess(res, result)
      } catch (err) {

        if (err.errorType != ERROR_TYPE.NOT_ALLOWED) {
          let presentDate = new Date().toISOString().split('T')[0]
          let callCount = genericApiCounterInstance.transCountDailyMap.get(`${organisationId}_${presentDate}`)
          if (callCount && callCount?.triesLeft < maxGenericApiHits) {
            genericApiCounterInstance.transCountDailyMap.set(`${organisationId}_${presentDate}`, { triesLeft: ++callCount.triesLeft })
          }
        }

        await this.organisationTransCount(organisationId, 'fail')
        logger.error("Error Encountered in readDataForCustomerTransaction function", err)
        sendError(res, err)
      }
    } catch (error) {
      sendError(res, error)
    }
  }

  async organisationPaymentCount(organisationId: any, status: any) {
    let _transaction = await customerDatabaseInstance.transaction()
    try {
      let apiCounter: any
      switch (status) {
        case 'success':
          // This line retrieves the API counter info for payments associated with a specific organization from a map 
          apiCounter = genericApiCounterInstance.genericApiMap.get(`payments_${organisationId}`)
          if (apiCounter) {
            //The counts are updated in hash map and dbase using genericApiCounterInstance.genericApiMap.set() and OrganisationCount.update()        
            let totalCount = ++apiCounter.totalCount
            let successCount = ++apiCounter.successCount
            let failCount = apiCounter.failCount

            //Update Count in Hash Map 
            genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
              {
                totalCount: totalCount, successCount: successCount, failCount: failCount,
                genericApiType: genericApiType.payments
              })
            //Update Count in Database
            await OrganisationCount.update({ totalCount, successCount, failCount }, {
              where:
                { organisationId, genericApiType: genericApiType.payments }, transaction: _transaction
            })
          }
          // if it doesn't exist then it will create new count with initial values and adds them to dbase and hashmaps 
          else {
            let orgCount = await OrganisationCount.findOne({
              where: {
                organisationId, genericApiType: genericApiType.payments
                // genericapi payments consist of fotfall,payments ,trans 
              },
              transaction: _transaction,
              attributes: ['totalCount', 'successCount', 'failCount'],
              // setting raw true it will provide desired o/p with cleaner look.
              raw: true
            })
            if (orgCount) {
              let totalCount = ++orgCount.totalCount
              let successCount = ++orgCount.successCount
              let failCount = orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
                { totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType: genericApiType.payments })
              //Update Count in Database

              await OrganisationCount.update({ totalCount, successCount, failCount }, {
                where:
                  { organisationId, genericApiType: genericApiType.payments }, transaction: _transaction
              })
            } else {
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
                { totalCount: 1, successCount: 1, failCount: 0, genericApiType: genericApiType.payments })
              //Create Count in Database
              await OrganisationCount.create({
                organisationId,
                genericApiType: genericApiType.payments, totalCount: 1, successCount: 1, failCount: 0
              },
                { transaction: _transaction })
            }
          }
          break
        case 'fail':
          apiCounter = genericApiCounterInstance.genericApiMap.get(`payments_${organisationId}`)
          if (apiCounter) {
            let totalCount = ++apiCounter.totalCount
            let successCount = apiCounter.successCount
            let failCount = ++apiCounter.failCount

            //Update Count in Hash Map
            genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
              {
                totalCount: totalCount, successCount: successCount, failCount: failCount,
                genericApiType: genericApiType.payments
              })

            //Update Count in Database
            await OrganisationCount.update({ totalCount, successCount, failCount },
              { where: { organisationId, genericApiType: genericApiType.payments }, transaction: _transaction })
          }

          else {
            let orgCount = await OrganisationCount.findOne({
              where: {
                organisationId, genericApiType: genericApiType.payments
              },
              transaction: _transaction,
              attributes: ['totalCount', 'successCount', 'failCount'],
              raw: true
            })
            if (orgCount) {
              let totalCount = ++orgCount.totalCount
              let successCount = orgCount.successCount
              let failCount = ++orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
                {
                  totalCount: totalCount, successCount: successCount, failCount: failCount,
                  genericApiType: genericApiType.payments
                })
              //Update Count in Database
              await OrganisationCount.update({ totalCount, successCount, failCount },
                { where: { organisationId, genericApiType: genericApiType.payments }, transaction: _transaction })
            } else {
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`payments_${organisationId}`,
                { total: 1, success: 0, fail: 1, genericApiType: genericApiType.payments })
              //Create Count in Database
              await OrganisationCount.create({
                organisationId, genericApiType: genericApiType.payments, totalCount: 1,
                successCount: 0, failCount: 1
              }, { transaction: _transaction })
            }
          }
          break
        default: break
      }
      await _transaction.commit()
      return 'success'
    }

    catch (error) {
      await _transaction.rollback()
      logger.error("Error Encountered while creating/updating count metrices", error)
    }
  }

  async organisationTransCount(organisationId: any, status: any) {

    let _transaction = await customerDatabaseInstance.transaction()
    try {
      let apiCounter: any
      switch (status) {
        case 'success':
          apiCounter = genericApiCounterInstance.genericApiMap.get(`transactions_${organisationId}`)

          if (apiCounter) {
            let totalCount = ++apiCounter.totalCount
            let successCount = ++apiCounter.successCount
            let failCount = apiCounter.failCount

            //Update Count in Hash Map
            genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`,
              {
                totalCount: totalCount, successCount: successCount, failCount: failCount,
                genericApiType: genericApiType.transactions
              })
            //Update Count in Database
            await OrganisationCount.update({ totalCount, successCount, failCount }, {
              where:
                { organisationId, genericApiType: genericApiType.transactions },
              transaction: _transaction
            })
          }
          // else partt >>> 
          else {
            let orgCount = await OrganisationCount.findOne({
              where: {
                organisationId, genericApiType: genericApiType.transactions
              },
              transaction: _transaction,
              attributes: ['totalCount', 'successCount', 'failCount', 'genericApiType'],
              raw: true
            })
            if (orgCount) {
              let totalCount = ++orgCount.totalCount
              let successCount = ++orgCount.successCount
              let failCount = orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`, { totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType: genericApiType.transactions })
              //Update Count in Database
              await OrganisationCount.update({ totalCount, successCount, failCount },
                { where: { organisationId, genericApiType: genericApiType.transactions }, transaction: _transaction })
            }
            else {
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`, { totalCount: 1, successCount: 1, failCount: 0, genericApiType: genericApiType.transactions })
              //Create Count in Database
              await OrganisationCount.create({ organisationId, genericApiType: genericApiType.transactions, totalCount: 1, successCount: 1, failCount: 0 }, { transaction: _transaction })
            }
          }
          break
        case 'fail':
          apiCounter = genericApiCounterInstance.genericApiMap.get(`transactions_${organisationId}`)
          if (apiCounter) {
            let totalCount = ++apiCounter.totalCount
            let successCount = apiCounter.successCount
            let failCount = ++apiCounter.failCount

            //Update Count in Hash Map
            genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`, { totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType: genericApiType.transactions })
            //Update Count in Database
            await OrganisationCount.update({ totalCount, successCount, failCount }, { where: { organisationId, genericApiType: genericApiType.transactions }, transaction: _transaction })
          } else {
            let orgCount = await OrganisationCount.findOne({
              where: {
                organisationId, genericApiType: genericApiType.transactions
              },
              transaction: _transaction,
              attributes: ['totalCount', 'successCount', 'failCount'],
              raw: true
            })
            if (orgCount) {
              let totalCount = ++orgCount.totalCount
              let successCount = orgCount.successCount
              let failCount = ++orgCount.failCount

              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`, { totalCount: totalCount, successCount: successCount, failCount: failCount, genericApiType: genericApiType.transactions })
              //Update Count in Database
              await OrganisationCount.update({ totalCount, successCount, failCount }, { where: { organisationId, genericApiType: genericApiType.transactions }, transaction: _transaction })
            } else {
              //Create Count in Hash Map
              genericApiCounterInstance.genericApiMap.set(`transactions_${organisationId}`, { total: 1, success: 0, fail: 1, genericApiType: genericApiType.transactions })
              //Create Count in Database
              await OrganisationCount.create({ organisationId, genericApiType: genericApiType.transactions, totalCount: 1, successCount: 0, failCount: 1 }, { transaction: _transaction })
            }
          }
          break
        default: break
      }
      await _transaction.commit()
      return 'success'
    } catch (error) {
      await _transaction.rollback()
      logger.error("Error Encountered while creating/updating count metrices", error)
    }
  }

  async readDataForCustomerCount(req: Request, res: Response) {
    try {
      // extract orgid and event from rqst querey params 
      let { orgId, eventType }: any = req.query

      const organisationId = AuthController.decodeBase64(orgId,)
      logger.info("Generic Api(Counts) for Customer::::", organisationId)

      // fetch from database 
      let orgCount = genericApiCounterInstance.genericApiMap.get(`${eventType}_${organisationId}`)
      if (!orgCount) {
        orgCount = await OrganisationCount.findOne({
          where: {
            organisationId,
            genericApiType: eventType
          },
          attributes: ['totalCount', 'successCount', 'failCount', 'genericApiType'],
          raw: true
        })
      }
      if (orgCount) {
        sendSuccess(res, orgCount)
      } else {
        sendSuccess(res, `Data for evenType ${eventType} is not present for the organisation`)
      }

    } catch (error) {
      logger.error('Customer count is not found in the database and hasMap::', error)
      sendError(res, error)
    }
  }

  checkForMaxRange(startDate: string, endDate: string) {
    let from = new Date(startDate).getTime()
    let to = new Date(endDate).getTime()
    let numberOfDays = (to - from) / (24 * 60 * 60 * 1000)
    if (numberOfDays < 0)
      throw new Exception(
        ERROR_TYPE.BAD_REQUEST,
        'startDate should be less than endDate',
      )
    if (numberOfDays > 7)
      throw new Exception(
        ERROR_TYPE.BAD_REQUEST,
        'Date range should be maximum 7 days',
      )

    return true
  }
}
