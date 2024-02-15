import Logger from 'bunyan'
import axios from 'axios'
import { EventFormat, SeverityLevel, IEvent } from './helper'
import { logger } from '../../../utils/logger'

export default class BibLogger extends Logger {
  isEvent: boolean
  eventUrl: string
  format: EventFormat
  serviceToken: string
  constructor(
    config: Logger.LoggerOptions,
    eventUrl: string,
    serviceCode: number,
    serviceToken: string,
  ) {
    super(config)
    this.isEvent = false
    this.eventUrl = eventUrl
    this.serviceToken = serviceToken
    this.format = new EventFormat(config.name, serviceCode)
  }
  info(): boolean
  info(error: Error, ...params: any[]): void
  info(obj: Object, ...params: any[]): void
  info(format: any, ...params: any[]): void

  info(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.info()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.INFO)
    }
    return super.info(first, ...params)
  }

  error(): boolean
  error(error: Error, ...params: any[]): void
  error(obj: Object, ...params: any[]): void
  error(format: any, ...params: any[]): void

  error(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.error()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.ERROR)
    }
    return super.error(first, ...params)
  }

  debug(): boolean
  debug(error: Error, ...params: any[]): void
  debug(obj: Object, ...params: any[]): void
  debug(format: any, ...params: any[]): void

  debug(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.debug()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.DEBUG)
    }
    return super.debug(first, ...params)
  }

  warn(): boolean
  warn(error: Error, ...params: any[]): void
  warn(obj: Object, ...params: any[]): void
  warn(format: any, ...params: any[]): void

  warn(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.warn()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.WARN)
    }
    return super.warn(first, ...params)
  }

  trace(): boolean
  trace(error: Error, ...params: any[]): void
  trace(obj: Object, ...params: any[]): void
  trace(format: any, ...params: any[]): void

  trace(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.trace()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.TRACE)
    }
    return super.trace(first, ...params)
  }

  fatal(): boolean
  fatal(error: Error, ...params: any[]): void
  fatal(obj: Object, ...params: any[]): void
  fatal(format: any, ...params: any[]): void

  fatal(first?: Error | Object | any, ...params: any[]): boolean | void {
    if (arguments.length === 0) return super.fatal()
    if (this.isEvent) {
      let data = {
        first: first,
        rest: params,
      }
      this.generateEvent(data, SeverityLevel.FATAL)
    }
    return super.fatal(first, ...params)
  }

  event(event: IEvent, ...params: any[]): void {
    this.createEventLog(event)
    super.info(event, ...params)
  }

  /**
   * @method to sent logs to the event service
   * @param flag set true for activating log events, default is false
   */
  setEventUp(flag: boolean = false) {
    this.isEvent = flag
  }

  generateEvent(
    data: { first?: Error | Object | any; rest: any[] },
    severity: SeverityLevel,
  ) {
    let event: IEvent
    if (data.first instanceof Error) {
      event = this.format.eventGenerator(
        data.first.message + data.rest.join(' '),
        severity,
        data.first.stack,
      )
    } else if (data.first instanceof Object) {
      event = this.format.eventGenerator(
        JSON.stringify(data.first) + data.rest.join(' '),
        severity,
      )
    } else event = this.format.eventGenerator(data.rest.join(' '), severity)
    this.createEventLog(event)
  }

  createEventLog = (event: any) => {

    axios({
      method: 'post',
      url: this.eventUrl,
      data: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        'service-token': this.serviceToken,
      },
    })
      .then(() => {})
      .catch((error) => {
        logger.error(`logger error : ${error.message}`)
      })
  }
}
