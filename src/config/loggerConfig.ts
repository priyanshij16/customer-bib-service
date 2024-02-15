import { loggerConfig } from './packages/bib-logger/config'
import { ROOT_DIR, SERVICE_TOKEN } from '../core/constants/constant'

export const loggerConfig_ = loggerConfig({
  logRoot: ROOT_DIR + 'log',
  eventUrl: process.env.EVENT_URL || 'http://localhost:4000/v1/event',
  serviceName: process.env.SERVICE_NAME || 'customerService',
  serviceCode: Number(process.env.SERVICE_CODE) || 12000,
  newStreams: [
    {
      path: ROOT_DIR + 'log/access.log',
      level: 'info',
      name: 'accessFileStream',
    },
  ],
  serviceToken: SERVICE_TOKEN,
  level: 'info',
})
