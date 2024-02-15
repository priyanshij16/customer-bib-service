import {
  LoggerOptions,
  LogLevel,
  Serializers,
  stdSerializers,
  Stream,
} from 'bunyan'
import BunyanFormat from 'bunyan-format'
import path from 'path'
export interface LoggerConfiguration {
  logRoot: string
  eventUrl: string
  serviceName: string
  serviceCode: number
  src?: boolean
  level?: LogLevel
  serializers?: Serializers
  newStreams?: Stream[]
  outputMode?: 'long' | 'bunyan' | 'short' | 'simple' | 'long' | 'json'
  colorFromLevel?: { [level: number]: string }
  color?: boolean
  levelInString?: boolean
  jsonIndent?: number
  serviceToken: string
}

export function loggerConfig(
  value: LoggerConfiguration,
): {
  config: LoggerOptions
  eventUrl: string
  serviceCode: number
  serviceToken: string
} {
  const {
    logRoot,
    eventUrl,
    serviceName,
    serviceCode,
    src = false,
    level = 'info',
    serializers = stdSerializers,
    newStreams = [],
    outputMode = 'long',
    colorFromLevel = {
      10: 'green',
      20: 'yellow',
      30: 'blue',
      40: 'yellow',
      50: 'red',
      60: 'red',
    },
    color = true,
    levelInString = true,
    jsonIndent = 2,
    serviceToken = '',
  }: LoggerConfiguration = value

  const stream = BunyanFormat({
    outputMode,
    colorFromLevel,
    color,
    levelInString,
    jsonIndent,
  })

  let config = {
    name: serviceName,
    level,
    src, // not ideal for production (slow)
    serializers,
    streams: newStreams.concat([
      {
        path: path.join(logRoot, '/error.log'),
        name: 'errorFileStream',
        level: 'error',
      },
      { stream },
    ]),
  }

  return {
    config,
    eventUrl,
    serviceCode,
    serviceToken,
  }
}
