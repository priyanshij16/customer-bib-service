
import client from 'prom-client'
import { logger } from './logger'
import { OrganisationCount } from '../models/organisationCount'



client.collectDefaultMetrics()

export const CounterGeneratorForAllLocation = async ( organisationName: any) => 
{

try{


  let name = `Successful_Hits_For_${organisationName}`

  if (client.register.getSingleMetric(name) == undefined) {

    const Counter_For_Successful_Hits = new client.Counter(

      {
        name: `Successful_Hits_For_${organisationName}`,
        help: 'total processed successful request'
      }

    )
    const Counter_For_Failed_Hits = new client.Counter(
      {
        name: `Failed_Hits_For_${organisationName}`,
        help: 'total Failed requests'
      }
    )
  }
}

catch(err){
logger.error("error in counter Generation for organisation",err)
}
}

class CountGeneratorForGenericApi{
  genericApiMap = new Map()
  paymentCountDailyMap = new Map()
  transCountDailyMap = new Map()
  private static _instance: CountGeneratorForGenericApi

  constructor(){
    OrganisationCount.findAll()
    .then((orgCount) => {
      orgCount.map((data) => {
            this.genericApiMap.set(`${data.genericApiType}_${data.organisationId.toUpperCase()}`, {
              totalCount: data?.totalCount,
              successCount: data?.successCount,
              failCount: data?.failCount,
              genericApiType: data?.genericApiType
            })
        })
    }).catch((err: any) => {
        logger.error("Failed to create genericApiMap::", err)
    })
  }

  public static get Instance() {
      return this._instance || (this._instance = new this())
  }
}

export const genericApiCounterInstance = CountGeneratorForGenericApi.Instance