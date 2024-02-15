import { logger } from './logger'
import moment from 'moment'
import { Exception } from './Helpers/Exception'
import constant from '../config/packages/bib-response-handler/constants.js'
import migrationDatabaseInstance from '../config/migrationDb'
import { PeopleMovementService } from '../core/services/PeopleMovement'
import Publisher from '../core/rabbit-mq/Publisher'
import { MIGRATION_ROUTING_KEY, migrationPath, uniqueConstraintError, validationError } from '../core/constants/constant'
import { MigrationLog } from '../models/migrationLog'
import { MigrationMetric } from '../models/migrationMetric'
import { LcdTransaction } from '../models/lcdTransaction'
import { LcdPayment } from '../models/lcdPayment'
import { LcdPeopleCount } from '../models/lcdPeopleCount'

class MigrationScript
{
  isRunning: any
  organisationId: any
  linkHierarchy: any
  eventType: any
  dataService: PeopleMovementService
  retryCount: any = 0
  retryList: any = []
  finalDataList: any = []
  migrateLog: any = {}
  migrateMetric: any = {}
  private static _instance: MigrationScript

  constructor(){
    this.dataService = new PeopleMovementService(migrationDatabaseInstance)
    this.runMigration = this.runMigration.bind(this)
    this.fetchDataFromLCD = this.fetchDataFromLCD.bind(this)
    this.checkRetryList = this.checkRetryList.bind(this)
    this.publishToRMQ = this.publishToRMQ.bind(this)
    this.checkDuplicateEvent = this.checkDuplicateEvent.bind(this)
  }

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  async runMigration(clientId: any, startDate: any, endDate: any, type: any, linkHierarchy: any){
    try{
      this.isRunning = true
      this.eventType = type
      this.organisationId = clientId
      this.linkHierarchy = linkHierarchy
      let start = moment(startDate)
      let end = moment(endDate).endOf('day')
      let currentDate = moment(start)
    
      this.finalDataList = []
      this.retryList = []

      this.migrateLog = {
        organisationId: this.organisationId,
        eventType: this.eventType,
        startDate: start,
        endDate: end,
        isSuccess: true
      }

      this.migrateMetric = {
        organisationId: this.organisationId,
        eventType: this.eventType,
        startDate: start,
        endDate: end,
        path: migrationPath.lcd_to_rmq,
        iterationCount: Number(0),
        retryCount: Number(0),
        twentyFourHourTimeout: Number(0),
        twelveHourTimeout: Number(0),
        sixHourTimeout: Number(0),
        errorCount: Number(0),
        receivedCount: Number(0),
        publishedCount: Number(0)
      }

      while(currentDate.isSameOrBefore(end)) {

        this.migrateMetric.iterationCount += 1 //set count for number of days the query is run
        let tempStartDate = moment(currentDate)
        let tempEndDate = moment(currentDate).endOf('day')

        try{
          let dataFetched = await this.fetchDataFromLCD(tempStartDate,tempEndDate)

          if(dataFetched?.length){
            this.migrateMetric.receivedCount += dataFetched.length //set data received count
            this.finalDataList = [...this.finalDataList, ...dataFetched]
          }
        } catch(err:any){
          this.migrateMetric.twentyFourHourTimeout += 1 //set 24 hour query timeout
          let twelveHourStart = moment(tempStartDate)
          let twelveHourEnd = moment(tempEndDate).subtract(12,'hours')
          let iterationCount = 2

          while(iterationCount-- > 0){
            try{
              let dataFetched = await this.fetchDataFromLCD(twelveHourStart,twelveHourEnd)

              if(dataFetched?.length){
                this.migrateMetric.receivedCount += dataFetched.length //set data received count
                this.finalDataList = [...this.finalDataList, ...dataFetched]
              }
            } catch(err:any){
              this.migrateMetric.twelveHourTimeout += 1 //set 12 hour query timeout
              let sixHourStart = moment(twelveHourStart)
              let sixHourEnd = moment(twelveHourEnd).subtract(6,'hours')
              let iterationCount = 2

              while(iterationCount-- > 0){
                try{
                  let dataFetched = await this.fetchDataFromLCD(sixHourStart,sixHourEnd)

                  if(dataFetched?.length){
                    this.migrateMetric.receivedCount += dataFetched.length //set data received count
                    this.finalDataList = [...this.finalDataList, ...dataFetched]
                  }
                } catch(err:any){
                  this.migrateMetric.sixHourTimeout += 1 //set 6 hour query timeout
                  this.retryList = [...this.retryList, {
                    clientId: this.organisationId,
                    eventType: this.eventType,
                    currentDate: currentDate.format('YYYY-MM-DD HH:mm:ss.SSS'),
                    startDate: sixHourStart.format('YYYY-MM-DD HH:mm:ss.SSS'),
                    endDate: sixHourEnd.format('YYYY-MM-DD HH:mm:ss.SSS'),
                  }]
                }

                sixHourStart = moment(sixHourStart).add(6,'hours')
                sixHourEnd = moment(twelveHourEnd)
              }
            }

            twelveHourStart = moment(twelveHourStart).add(12,'hours')
            twelveHourEnd = moment(tempEndDate)
          }
        }

        currentDate = currentDate.add(1, 'day')
      }

      while((this.retryList?.length) && (this.retryCount++ < 2)){
        await this.checkRetryList()
      }

      if(this.retryList?.length){
        this.migrateLog.retryList = [...this.retryList]
        this.migrateLog.isSuccess = false
      }

      await this.publishToRMQ(start,end)
      await MigrationLog.create(this.migrateLog)
      await MigrationMetric.create(this.migrateMetric)
      this.isRunning = false

      return Promise.resolve(true)
    } catch(error:any){
      this.isRunning = false
      if(this.migrateMetric?.errorCount || (this.migrateMetric?.errorCount == Number(0))){
        this.migrateMetric.errorCount += 1
        await MigrationMetric.create(this.migrateMetric)
      }

      logger.error("Error encountered while fetching transactions data",error)
      return Promise.reject(error)
    }
  }

  async fetchDataFromLCD(startDate: any, endDate: any){
    try{
      let start = moment(startDate).format('YYYY-MM-DD HH:mm:ss.SSS')
      let end = moment(endDate).format('YYYY-MM-DD HH:mm:ss.SSS')
      let dbQuery: any
  
      switch(this.eventType){
        case "transactions":
          dbQuery = `EXEC MIGRATE_GETCombinedTransactionData
          @OrganisationID = '${this.organisationId}',
          @startDate = '${start}',
          @EndDate = '${end}'`
          break
  
        case "payments":
          dbQuery = `EXEC MIGRATE_GETCombinedPaymentData
          @OrganisationID = '${this.organisationId}',
          @startDate = '${start}',
          @EndDate = '${end}'`
          break
  
        case "footfall":
          dbQuery = `EXEC Migrate_GETCombinedFootfallData
          @OrganisationID = '${this.organisationId}',
          @startDate = '${start}',
          @EndDate = '${end}'`
          break
  
        default:
          break
      }
  
      if(dbQuery !== undefined){
        let result = await this.dataService.read(dbQuery)
        return result
      } else {
        throw new Exception(constant.ERROR_TYPE.INTERNAL,'Could not fetch data due to eventType mismatch')
      }
    } catch(err: any){
      logger.error(`Error encountered while fetching data from LCD for eventType: ${this.eventType}`, err)
      throw err
    }
  }

  async checkRetryList(){
    try{
      this.migrateMetric.retryCount += 1 //set retry count on missed date-time
      let repeatList: any = []

      for(let retryItem of this.retryList){
        try{
          let dataFetched = await this.fetchDataFromLCD(retryItem?.startDate,retryItem?.endDate)

          if(dataFetched?.length){
            this.migrateMetric.receivedCount += dataFetched.length //set data received count
            this.finalDataList = [...this.finalDataList, ...dataFetched]
          }
        } catch(error: any){
          repeatList.push(retryItem)
        }
      }

      if(repeatList?.length)
        this.retryList = [...repeatList]
      else
        this.retryList = []

      return Promise.resolve(true)
    } catch(err: any){
      logger.error("Error encountered while publishing data in RMQ", err)
      throw err
    }
  }

  async publishToRMQ(startDate: any, endDate: any){
    try{
      const publisher = await Publisher.getInstance()
      this.migrateMetric.publishedCount = 0
      let start = moment(startDate).format('YYYY-MM-DD HH:mm:ss.SSS')
      let end = moment(endDate).format('YYYY-MM-DD HH:mm:ss.SSS')

      for(let lcEvent of this.finalDataList){
        let isUnique = await this.checkDuplicateEvent(lcEvent)

        if(!isUnique)
          continue

        lcEvent.EventType = this.eventType
        lcEvent.CustomerKey = this.linkHierarchy?.parentHierarchy?.id ?? this.organisationId
        lcEvent.LocationID = await this.findLocationId(lcEvent?.LocationID,this.linkHierarchy?.childHierarchies)
        lcEvent.StartDate = start
        lcEvent.EndDate = end
        lcEvent.TimeZone = this.linkHierarchy?.parentHierarchy?.info?.timezone ?? this.linkHierarchy?.parentHierarchy?.info?.timeZone

        publisher.publish({data: lcEvent},MIGRATION_ROUTING_KEY)
        this.migrateMetric.publishedCount += 1 //set count of data published on rmq
      }

      return true
    } catch(err: any){
      logger.error("Error encountered while publishing data in RMQ", err)
      throw err
    }
  }

  async findLocationId(locationId: any, childHierarchies: any){
    try{
      let result = locationId

      for(let child of childHierarchies){
        if(child?.lchierarchyId?.toLowerCase() == locationId?.toLowerCase())
          result = child?.id
      }

      return result
    }catch(err: any){
      logger.error("Error encountered in finding location",err)
      return locationId
    }
  }

  async checkDuplicateEvent(lcEvent: any){
    try{
      let isUnique: any
      switch(this.eventType){
        case "transactions":
          isUnique = await this.storeTransactionEvent(lcEvent)
          break
        case "payments":
          isUnique = await this.storePaymentEvent(lcEvent)
          break
        case "footfall":
          isUnique = await this.storePeopleCountEvent(lcEvent)
          break
        default:
          break
      }

      return isUnique
    } catch(err: any){
      logger.error("Error encountered while checking duplicate event", err)
      return false
    }
  }

  async storeTransactionEvent(lcEvent: any){
    try{
      let isUniqueEvent: any
      let eventTimestamp = lcEvent?.Timestamp?.toISOString()
      let uniqueKey = `${lcEvent?.DeviceIdentifier}_${eventTimestamp}_${lcEvent?.Action}_${lcEvent?.ItemIdentifier}`

      try {
        let retObj = await LcdTransaction.create({
          deviceIdentifier: lcEvent?.DeviceIdentifier,
          uniqueKey: uniqueKey,
          eventTimestamp: eventTimestamp
        })

        if(retObj)
          isUniqueEvent = true
      } catch (err) {
        if (err?.message?.includes(uniqueConstraintError) || err?.message?.includes(validationError)) {
          isUniqueEvent = false
        } else {
          logger.error("Failed to insert lcd transaction event:", err)
        }
      }

      return isUniqueEvent
    } catch(err: any){
      logger.error("Error encountered in uniqueTransactionEvent function", err)
    }
  }

  async storePaymentEvent(lcEvent: any){
    try{
      let isUniqueEvent: any
      let eventTimestamp = lcEvent?.Timestamp?.toISOString()
      let uniqueKey = `${lcEvent?.DeviceIdentifier}_${eventTimestamp}_${lcEvent?.PaymentType}_${lcEvent?.ItemIdentifier}`

      try {
        let retObj = await LcdPayment.create({
          deviceIdentifier: lcEvent?.DeviceIdentifier,
          uniqueKey: uniqueKey,
          eventTimestamp: eventTimestamp
        })

        if(retObj)
          isUniqueEvent = true
      } catch (err) {
        if (err?.message?.includes(uniqueConstraintError) || err?.message?.includes(validationError)) {
          isUniqueEvent = false
        } else {
          logger.error("Failed to insert lcd payment event:", err)
        }
      }

      return isUniqueEvent
    } catch(err: any){
      logger.error("Error encountered in uniquePaymentEvent function", err)
      throw err
    }
  }

  async storePeopleCountEvent(lcEvent: any){
    try{
      let isUniqueEvent: any
      let eventTimestamp = lcEvent?.LastUpdated?.toISOString()
      let uniqueKey = `${lcEvent?.DeviceIdentifier}_${eventTimestamp}_${lcEvent?.InstanceID}_${lcEvent?.DeviceName}`

      try {
        let retObj = await LcdPeopleCount.create({
          deviceIdentifier: lcEvent?.DeviceIdentifier,
          uniqueKey: uniqueKey,
          eventTimestamp: eventTimestamp
        })

        if(retObj)
          isUniqueEvent = true
      } catch (err) {
        if (err?.message?.includes(uniqueConstraintError) || err?.message?.includes(validationError)) {
          isUniqueEvent = false
        } else {
          logger.error("Failed to insert lcd transaction event:", err)
        }
      }

      return isUniqueEvent
    } catch(err: any){
      logger.error("Error encountered in uniquePeopleCountEvent function", err)
      throw err
    }
  }
}

export const migrationScriptInstance = MigrationScript.Instance