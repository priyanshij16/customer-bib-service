//'use strict'
import { check, query, param, oneOf, body } from 'express-validator'
import { AuthController } from '../../controllers/AuthController'
import { Validator } from './Validator'

class PeopleMovementValidator extends Validator {
  constructor() {
    super({
      key: [
        body('key').custom((key) => {
          if (
            key &&
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              AuthController.decodeBase64(key),
            )
          ) {
            return true
          }
          else if(((key == null) || (key == ""))){
            throw Error('Organization key is required')
          }
          throw Error('Invalid key')
        }),
      ],
      param: [
        param('id').custom((id) => {
          if (
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              AuthController.decodeBase64(id),
            )
          ) {
            return true
          }
          else if(((id == null) || (id == ""))){
            throw Error('Organization id is required')
          }
          throw Error('Invalid key')
        }),
      ],
      index: [
        param('id')
          .trim()
          .isUUID()
          .withMessage('organisationId should be uuid'),
        check('startDate')
          .optional()
          .trim()
          .isISO8601()
          .withMessage('startDate should be a valid date in ISO 8601 format'),
        check('endDate')
          .optional()
          .trim()
          .isISO8601()
          .withMessage('startDate should be a valid date in ISO 8601 format'),

        check('locations')
          .optional()
          .isArray()
          .withMessage('locations contains the array of location Id')
          .isUUID()
          .withMessage('location should be UUID'),

        check('frequency')
          .optional()
          .isString()
          .trim()
          .toUpperCase()
          .isIn(['HOUR', 'DAY', 'WEEK'])
          .withMessage(`frequency should only be one of 'HOUR','DAY','WEEK'`),
        check('devices')
          .optional()
          .isArray()
          .withMessage('devices should be array of devices')
          .isUUID()
          .withMessage('deviceId should be UUID'),
      ],
      auth: [
        check('clientId')
          .notEmpty()
          .withMessage('clientId should not be empty')
          .isUUID()
          .withMessage('clientId should be UUID'),

        check('expiresIn')
          .optional()
          .isInt()
          .withMessage('expiresIn shoudl be in seconds'),
      ],
    })
  }
}

export let peopleMovementValidator = new PeopleMovementValidator()
