const Exception = require('./Exception')
const { ERROR_TYPE } = require('./constants')

module.exports = {
  internalServerError(errMsg, err) {
    return new Exception(
      ERROR_TYPE.INTERNAL,
      errMsg || 'Please try after sometime',
      err,
    )
  },
  badRequestError(errMsg, err) {
    return new Exception(ERROR_TYPE.BAD_REQUEST, errMsg || 'Bad request', err)
  },
  unAuthenticatedAccess(errMsg, err) {
    return new Exception(
      ERROR_TYPE.UNAUTHORIZED,
      errMsg || 'Unauthorized access',
      err,
    )
  },
  forbiddenAccess(errMsg, err) {
    return new Exception(
      ERROR_TYPE.FORBIDDEN,
      errMsg || 'Forbidden access',
      err,
    )
  },
  notFoundError(errMsg, err) {
    return new Exception(ERROR_TYPE.NOT_FOUND, errMsg || 'No route found', err)
  },
  notAllowedError(errMsg, err) {
    return new Exception(
      ERROR_TYPE.NOT_ALLOWED,
      errMsg || 'Method not allowed',
      err,
    )
  },
  alreadyExistError(errMsg, err) {
    return new Exception(
      ERROR_TYPE.ALREADY_EXISTS,
      errMsg || 'Already Exists',
      err,
    )
  },
}
