import * as RMQ from 'amqp-ts'
import { logger } from '../../../../utils/logger'

export class Publisher {
  connection: RMQ.Connection | undefined | null
  exchange: RMQ.Exchange | undefined
  queue: RMQ.Queue | undefined

  constructor(url: string, exchange: string, exchangeType: string = 'topic') {
    if (!this.connection) {
      this.connection = new RMQ.Connection(url)
    }

    this.initExchange(exchange, exchangeType)
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

  /**
   *
   * @param message - the message to be send
   * @param key - pattern/key to match for the queue
   * @param opts - options to provide in message
   */

  publish(message: any, key: string, opts: any = {}) {
    let msg = new RMQ.Message(message, opts)
    this.exchange?.send(msg, key)
  }
}
