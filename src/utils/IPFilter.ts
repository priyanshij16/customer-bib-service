import { Request, Response, NextFunction } from 'express'
import { Exception } from './Helpers/Exception'
import { sendError } from './Helpers/resHandler'
import { logger } from './logger'
const { ERROR_TYPE } = require('./Helpers/constants')

export default (IPs: string[], options?: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let remoteAddress =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip

    if (remoteAddress && IPs.includes(normalizeIP(remoteAddress))) {
      next()
    } else {
      // Invalid ip
      logger.error('Unknown IP ', remoteAddress)
      const err = new Exception(
        ERROR_TYPE.UNAUTHORIZED,
        'Unknown IP: ' + remoteAddress,
      )
      sendError(res, err)
      //   next(err)
    }
  }
}

function normalizeIP(ip: any) {
  if (ip.substring(0, 7) === '::ffff:') {
    ip = ip.substring(7)
  }
  return ip
}
