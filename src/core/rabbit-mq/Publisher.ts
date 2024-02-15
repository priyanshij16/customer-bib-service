import * as RMQ from 'amqp-ts'
import { MIGRATION_EXCHANGE } from '../constants/constant';
import { logger } from '../../utils/logger'
RMQ.log.transports.console.level = 'info';

let instance: Publisher

class Publisher {
  connection: RMQ.Connection | undefined
  exchange: RMQ.Exchange | undefined
  static getInstance: () => Promise<Publisher>
  constructor() { }

  /**
   * Initialize connection to rabbitMQ
   */
   init = async (exchange: string, exchangeType: string = 'direct') => {
    let rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost'
    try {
      this.connection = new RMQ.Connection(
        rmqUrl,
      )
      this.exchange = this.connection?.declareExchange(exchange, exchangeType, {
        durable: true,
      })
      
    } catch (error) {
      logger.error(` failed to establish connection with rmq using url  ${rmqUrl} `, error)
    }
    return this
  }

  /**
   *
   * @param message - the message to be send
   * @param key - pattern/key to match for the queue
   * @param opts - options to provide in message
   */

   publish(message: any, key: string, opts: any = {}) {
    try {
      this.connection?.completeConfiguration()
        .then(() => {
          let msg = new RMQ.Message(message, opts)
          if(this.connection?.isConnected){
            this.exchange?.send(msg, key)
            return true
          }
          else{
            logger.error("RMQ connection not established in event",key)
            return false
          }
        });
    } catch (error) {
      logger.error(" Error in publishing message ", error)
      return false
    }
  }
}

Publisher.getInstance = async function () {
  if (!instance) {
    const broker = new Publisher()
    instance = await broker.init(MIGRATION_EXCHANGE)
  }
  return instance
}

export default Publisher
