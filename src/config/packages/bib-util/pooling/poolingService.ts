import { logger } from "../../../../utils/logger"
const axios = require('axios').default
var schedule = require('node-schedule')

export class Pooling {
  poolUrl: String
  firstJob: boolean
  date: string
  options: any

  constructor(poolUrl: string, options: any) {
    this.poolUrl = poolUrl
    this.options = options
    this.firstJob = true
    this.date = '0'
  }

  async getPool() {
    let requestData = {
      url: `${this.poolUrl}?pool=1&updatedAfter=${this.date}`,
      method: 'GET',
      headers: this.options.headers,
    }

    try {
      let response = await axios(requestData)
      return Promise.resolve(response.data)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  schedular(callback: (pool: any) => any, interval: string | number) {
    var rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, Number(interval))
    var job = schedule.scheduleJob(rule, () => {
      this.getPool()
        .then((pool: any) => {
          callback(pool)
          this.date = new Date().getTime().toString()
          this.firstJob = false
        })
        .catch((err: any) => {
          logger.error('error in pooling: ', err.message)
        })
    })
  }
}
