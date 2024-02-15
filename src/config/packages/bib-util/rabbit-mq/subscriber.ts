import * as RMQ from 'amqp-ts'
import { logger } from '../../../../utils/logger'

export class Subscriber {
  connection: RMQ.Connection | undefined | null
  exchange: RMQ.Exchange | undefined
  queue: RMQ.Queue | undefined
  constructor(url: string, exchange: string, exchangeType: string = 'topic') {
    try {
      if (!this.connection) {
        this.connection = new RMQ.Connection(url)
      }

      this.initExchange(exchange, exchangeType)
    } catch (err) {
      logger.error(err, 'error in creating connection')
    }
  }

  initExchange(exchange: string, exchangeType: string) {
    try {
      this.exchange = this.connection?.declareExchange(exchange, exchangeType, {
        durable: true,
      })
    } catch (err) {
      logger.error(err, 'error in creating exchange')
    }
  }

  initQueue(queueName: string, pattern: string) {
    try {
      this.queue = this.connection?.declareQueue(queueName, { durable: true })
      if (this.exchange) this.queue?.bind(this.exchange!!, pattern)
      return this.queue
    } catch (err) {
      logger.error(err)
    }
  }
}
