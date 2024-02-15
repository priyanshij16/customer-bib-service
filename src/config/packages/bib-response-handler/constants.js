const path = require('path')

module.exports = {
  EVENT: {
    EVENT_BASE: 10000,
    RANGE: 99,
  },
  STATUS_CODE: {
    ERROR: 0,
    SUCCESS: 1,
    INVALID_TOKEN: 1000,
  },
  RESPONSE_STATUS: {
    SUCCESS: 200,
    SUCCESS_CREATED: 201,
    SUCCESS_NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    INTERNAL_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    ALREADY_EXISTS: 409,
  },
  ERROR_TYPE: {
    NOT_FOUND: 'NotFoundError',
    UNAUTHORIZED: 'AuthFailureError',
    INTERNAL: 'InternalError',
    BAD_REQUEST: 'BadRequestError',
    FORBIDDEN: 'ForbiddenError',
    NOT_IMPLEMENTED: 'NotImplementedError',
    ALREADY_EXISTS: 'AlreadyExistsError',
    NOT_ALLOWED: 'MethodNotAllowedError'
  },
  STATUS: {
    DELETED: 0,
    ACTIVE: 1,
    INACTIVE: 2,
  },
  ROLES: {
    PLATFORM_ADMIN: 1,
    USER: 2,
  },
}
