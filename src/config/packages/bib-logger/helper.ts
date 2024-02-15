export interface IEvent {
  eventId: number
  severity: string
  eventUser?: number
  eventSrc: number | string
  eventSrcType: string
  eventSrcName: string
  clearingEvent: Array<number>
  data: {
    metadata: {
      name: string
      category: string
      origin?: string
    }
    description: {
      content: string
      detailedDiscription?: string
      params?: JSON
    }

    traceLogs?: Array<any>
  }
  isAlert?: boolean
  isAudit?: boolean
  eventTimestamp: string
}

export enum SeverityLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

const LOG_EVENT_ID = 9999

export class EventFormat {
  service: string
  serviceCode: number
  constructor(
    serviceName: string = 'nextgen library connect',
    serviceCode: number = 0,
  ) {
    this.service = serviceName
    this.serviceCode = serviceCode
  }
  /**
   * @param severity : set event severity out of 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'fatal'
   * @param trace : send stack trace in case of error log
   */
  eventGenerator(event: any, severity: SeverityLevel, trace?: any): IEvent {
    return {
      eventId: LOG_EVENT_ID,
      severity: severity,
      eventSrcName: this.service,
      eventSrc: this.serviceCode,
      eventSrcType: 'service',
      clearingEvent: [],
      isAlert: false,
      isAudit: false,
      data: {
        description: {
          content: event,
        },
        traceLogs: [trace],
        metadata: {
          name: 'dev logs',
          category: 'logs',
        },
      },
      eventTimestamp: new Date().toISOString(),
    }
  }
}
