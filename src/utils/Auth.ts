import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { KEY } from '../core/constants/constant'
import { Exception } from './Helpers/Exception'
import { sendError } from './Helpers/resHandler'
const { ERROR_TYPE } = require('./Helpers/constants')

const excludedURL: string[] = ['/customer/api/v1/generateToken']

export function Auth(req: Request, res: Response, next: NextFunction) {
  try {
    if (checkExcludedURL(req.url)) return next()
    if (!req.headers.authorization) {
      throw new Exception(ERROR_TYPE.UNAUTHORIZED, 'Unautherised Access')
    }
    let serviceToken =
      req.headers.authorization.split(' ')[1] || req.headers.authorization

    let verification: any = verify(serviceToken, process.env.SECRET_KEY || KEY)
    if (verification) {
      res.locals.clientId = verification.clientId
      return next()
    }
    throw new Exception(ERROR_TYPE.UNAUTHORIZED, 'Unautherised Access')
  } catch (err) {
    sendError(res, err)
  }
}

function checkExcludedURL(url: string) {
  let response = false
  excludedURL.forEach((element) => {
    if (url.includes(element)) response = true
  })
  return response
}
