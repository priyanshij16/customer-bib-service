import { Exception } from './Exception'
const { ERROR_TYPE } = require('./constants')

export default {
  internalServerError(errMsg: string, err: Error) {
    return new Exception(
      ERROR_TYPE.INTERNAL,
      errMsg || 'Please try after sometime',
      err,
    )
  },
  badRequestError(errMsg: string, err: Error) {
    return new Exception(ERROR_TYPE.BAD_REQUEST, errMsg || 'Bad request', err)
  },
  unAuthenticatedAccess(errMsg: string, err: Error) {
    return new Exception(
      ERROR_TYPE.UNAUTHORIZED,
      errMsg || 'Unauthorized access',
      err,
    )
  },
  forbiddenAccess(errMsg: string, err: Error) {
    return new Exception(
      ERROR_TYPE.FORBIDDEN,
      errMsg || 'Forbidden access',
      err,
    )
  },
  notFoundError(errMsg: string, err: Error) {
    return new Exception(ERROR_TYPE.NOT_FOUND, errMsg || 'No route found', err)
  },
  notAllowedError(errMsg: string, err: Error) {
    return new Exception(
      ERROR_TYPE.NOT_ALLOWED,
      errMsg || 'Method not allowed',
      err,
    )
  },
  alreadyExistError(errMsg: string, err: Error) {
    return new Exception(
      ERROR_TYPE.ALREADY_EXISTS,
      errMsg || 'Already Exists',
      err,
    )
  },
}
