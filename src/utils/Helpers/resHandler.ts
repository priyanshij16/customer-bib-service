import { NextFunction, Request, Response } from 'express'
import { APIResponse } from './APIResponse'
import { Exception } from './Exception'
import exception from './customExceptions';
const { STATUS_CODE, ERROR_TYPE, RESPONSE_STATUS } = require('./constants')

let result

export function sendResponse(res: Response, rslt: any, statusCode = undefined) {
  let err = rslt && rslt.error
  if (err) {
    switch (err.errorType) {
      case ERROR_TYPE.UNAUTHORIZED:
        return res.status(RESPONSE_STATUS.UNAUTHORIZED).send(rslt)
      case ERROR_TYPE.INTERNAL:
        return res.status(RESPONSE_STATUS.INTERNAL_ERROR).send(rslt)
      case ERROR_TYPE.BAD_REQUEST:
        return res.status(RESPONSE_STATUS.BAD_REQUEST).send(rslt)
      case ERROR_TYPE.NOT_IMPLEMENTED:
        return res.status(RESPONSE_STATUS.NOT_IMPLEMENTED).send(rslt)
      case ERROR_TYPE.ALREADY_EXISTS:
        return res.status(RESPONSE_STATUS.ALREADY_EXISTS).send(rslt)
      case ERROR_TYPE.NOT_ALLOWED:
        return res.status(RESPONSE_STATUS.NOT_ALLOWED).send(rslt)
      case ERROR_TYPE.FORBIDDEN:
        return res.status(RESPONSE_STATUS.FORBIDDEN).send(rslt)
      case ERROR_TYPE.NOT_FOUND:
        return res.status(RESPONSE_STATUS.NOT_FOUND).send(rslt)
      case ERROR_TYPE.TIMEOUT_ERROR:
        return res.status(RESPONSE_STATUS.TIMEOUT_ERROR).send(rslt)
      case ERROR_TYPE.TOOLARGE_ERROR:
        return res.status(RESPONSE_STATUS.TOOLARGE_ERROR).send(rslt)
      default:
        return res.status(RESPONSE_STATUS.INTERNAL_ERROR).send(rslt)
    }
  }

  if (statusCode) return res.status(statusCode).send(rslt)
  return res.status(RESPONSE_STATUS.SUCCESS).send(rslt)
}

export function sendError(res: Response, err: Exception) {
  if (!err.errorType) {
    err = exception.internalServerError('',err)
  }
  result = new APIResponse(STATUS_CODE.ERROR, err)
  sendResponse(res, result)
}

export function hndlError(
  err: Exception,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // unhandled error
  sendError(res, err)
}

export function sendSuccess(
  res: Response,
  result: any,
  statusCode = RESPONSE_STATUS.SUCCESS,
) {
  result = new APIResponse(STATUS_CODE.SUCCESS, result)
  sendResponse(res, result, statusCode)
}

export function sendSuccessWithMsg(
  res: Response,
  msg: string,
  statusCode = RESPONSE_STATUS.SUCCESS,
) {
  let rslt = { message: msg }
  let result = new APIResponse(STATUS_CODE.SUCCESS, rslt)
  sendResponse(res, result, statusCode)
}
